export default async function delegateToWorker(path: string, func: (...args: any[]) => Promise<any>, args: object): Promise<any> {

  if (process.env.FLY_PROCESS_GROUP === 'worker') {
    console.log('running on the worker...');
    return func({...args});

  } else {
    console.log('sending new request to worker...');
    const workerHost = process.env.NODE_ENV === 'development' ? 'localhost:3001' : `worker.process.${process.env.FLY_APP_NAME}.internal:3000`;

    const response = await fetch(`http://${workerHost}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({...args })
    });
    return response.json();
  }

}