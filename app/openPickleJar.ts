import extract from "extract-zip";
import path from "path";
import fs from "fs";
import Jimp from "jimp";
import { v4 as uuidv4 } from 'uuid';
import s3 from "@/utils/s3";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function openPickleJar({ width, height }: {width: number, height: number}): Promise<string[]>{
  console.log('opening pickle jar...');
  const pickleJarZip = path.resolve(process.cwd(), "public/pickle-jar.zip");
  const picklesDir = path.resolve(process.cwd(), "public/pickles");
  const picklesSmDir = path.resolve(process.cwd(), "public/pickles-sm");
  
  console.log('deleting old pickles...');
  await deleteOldPickles(picklesDir);
  await deleteOldPickles(picklesSmDir);

  console.log('extracting pickles...');
  await extract(pickleJarZip, { dir: picklesDir });
  const pickles = fs.readdirSync(path.resolve(process.cwd(), "public/pickles"))
  let picklesSm: string[] = [];
  
  console.log('resizing pickle photos...');
  for (const file of pickles) {
    const pickle = await Jimp.read(path.resolve(process.cwd(), "public/pickles", file))
    const newFilename = uuidv4() + "-" + file;
    const newPath = path.resolve(process.cwd(), "public/pickles-sm", newFilename);
    const resized = await pickle.resize(width, height);
    
    resized.write(newPath, async () => {
      console.log('uploading pickle photos...');
      const imageBuffer = fs.readFileSync(newPath);
      await s3.send(new PutObjectCommand({ Bucket: 'open-pickle-jar', Key: newFilename, Body: imageBuffer }));
      console.log('generating presigned url...');
      const command = new GetObjectCommand({ Bucket: 'open-pickle-jar', Key: newFilename });
      const src = await getSignedUrl(s3, command, { expiresIn: 36000 });
      picklesSm.push(src);
    });
  }
  console.log('the pickles:', picklesSm);
  return picklesSm;
}

async function deleteOldPickles(dir:string) {
  fs.readdir(dir, (err, files) => {
    if (err) throw err;
  
    for (const file of files) {
      fs.unlink(path.join(dir, file), (err) => {
        if (err) throw err;
      });
    }
  });
}