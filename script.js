const fs = require('fs');
const { exec } = require('child_process');

// Read all requests from file
const requests = fs
  .readFileSync('./requests.txt', 'utf8')
  .split('\n')
  .filter(line => line.trim().length > 0);

console.log(`Executing ${requests.length} requests in parallel...\n`);

// Run all curl commands concurrently
const processes = requests.map(cmd =>
{
  return new Promise((resolve, reject) =>
  {
    exec(cmd, (error, stdout, stderr) =>
    {
      if (error)
      {
        console.error(`Error in command "${cmd}":`, stderr);
        reject(error);
      } else
      {
        console.log(`Response from "${cmd}":\n${stdout}`);
        resolve(stdout);
      }
    });
  });
});

Promise.all(processes)
  .then(() => console.log('\nAll requests completed'))
  .catch(() => console.log('\nSome requests failed'));