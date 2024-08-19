import dbClient from './utils/db';

const waitConnection = () => new Promise((resolve, reject) => {
  let i = 0;
  const repeatFct = async () => {
    await setTimeout(() => {
      i += 1;
      if (i >= 10) {
        reject();
      } else if (!dbClient.isAlive()) {
        repeatFct();
      } else {
        resolve();
      }
    }, 1000);
  };
  repeatFct();
});

const users = [
  { name: 'Aliceee', email: 'alice@example.com' },
  { name: 'Bobee', email: 'bob@example.com' },
  { name: 'Charlieee', email: 'charlie@example.com' },
];

const files = [
  { name: 'file4.txt', type: 'text', size: 1234 },
  { name: 'file5.jpg', type: 'image', size: 5678 },
  { name: 'file6.pdf', type: 'pdf', size: 91011 },
];

(async () => {
  console.log(dbClient.isAlive());
  await waitConnection();
  console.log(dbClient.isAlive());

  for (const user of users) {
    const userId = await dbClient.addUser(user);
    console.log(`Added user with ID: ${userId}`);
  }

  // Add files
  for (const file of files) {
    const fileId = await dbClient.addFile(file);
    console.log(`Added file with ID: ${fileId}`);
  }

  console.log(await dbClient.nbUsers());
  console.log(await dbClient.nbFiles());
})();
