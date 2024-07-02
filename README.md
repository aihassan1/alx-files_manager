# File Manager Backend Project

This project focuses on building the backend functionalities of a file manager application using Node.js, Express, MongoDB, Redis, and Bull.

## Learning Objectives

By the end of this project, I was able to:

- Create an API using Express.js
- Implement user authentication mechanisms
- Store data in MongoDB
- Utilize Redis for temporary data storage
- Set up and use background workers for asynchronous tasks

## Requirements

- **Text Editors**: vi, vim, emacs, Visual Studio Code
- **Development Environment**: Ubuntu 18.04 LTS with Node.js (version 12.x.x)
- **File Extensions**: .js
- **Linting**: ESLint

## Provided Files

- `package.json`: Contains project dependencies.
- `.eslintrc.js`: ESLint configuration file.
- `babel.config.js`: Babel configuration file (if needed for transpilation).

## Tasks

### 1. Redis Utils

Create a `redis.js` file containing a `RedisClient` class. This class should handle:

- Connecting to Redis
- Checking connection status
- Methods:
  - `get(key)`
  - `set(key, value, duration)`
  - `del(key)`

### 2. MongoDB Utils

Create a `db.js` file containing a `DBClient` class. This class should handle:

- Connecting to MongoDB based on environment variables
- Methods:
  - `isAlive()`: Check connection status
  - `nbUsers()`: Count the number of users
  - `nbFiles(): Count the number of files

### 3. First API

Set up an Express server in `server.js`:

- Listen on a port (default: 5000)
- Create a `routes` folder containing `index.js` for API endpoints
- Create a `controllers` folder for handling request logic

#### Implement Endpoints in `controllers/AppController.js`:

- `GET /status`: Returns the status of Redis and MongoDB connection (alive/not alive)
- `GET /stats`: Returns the number of users and files from the database

### 4. Create a New User

Add a `POST /users` endpoint in `routes/index.js` for user registration:

- Logic in `controllers/UsersController.js`:
  - Check for mandatory fields (email, password)
  - Hash the password using SHA1 before storing it
  - Return an error if the email already exists
  - Upon successful registration, return the newly created user object (including ID and email)

### 5. Authenticate a User

Implement functionalities in `controllers/AuthController.js`:

- `GET /connect`: Uses Basic Auth to authenticate a user based on email and password (hashed). If successful:
  - Generate a random token and store it in Redis with a 24-hour expiry for the user ID
  - Return the generated token
- `GET /disconnect`: Deletes the user's token from Redis based on the provided token in the request header
- `GET /users/me`: Retrieves the user information based on the token provided in the request header

### 6. First File

Implement functionalities in `controllers/FilesController.js`:

- For files/images:
  - Save the document in the database with a reference to the actual file data stored externally (e.g., cloud storage)
  - Return the details of the newly created file/image upon successful upload
- Handle external file storage (if applicable):
  - Use additional libraries/services to upload files to a cloud storage platform like Amazon S3 or Google Cloud Storage
  - The controller should interact with these services to store and retrieve the actual file data

### 7. List Files

Implement functionalities in `controllers/FilesController.js`:

- `GET /files`: Retrieves a list of files and folders based on the provided directory ID (optional) and user ID from the token
  - Filter results based on user permissions (public/private)
  - Return a JSON response containing file/folder details like name, type, size (for files), and creation date

### 8. Get File Details

Implement functionalities in `controllers/FilesController.js`:

- `GET /files/:id`: Retrieves details of a specific file/folder based on its ID from the URL path
  - Handle access control: ensure the user has permission (owner or public file) to access the requested resource
  - Return a JSON response containing file/folder details like name, type, size (for files), and creation date

### 9. Download File

Implement functionalities in `controllers/FilesController.js`:

- `GET /files/:id/download`: Handles requests to download a file based on its ID from the URL path
  - Authenticate the user and ensure they have permission to download the file
  - Retrieve the file data from the external storage (if applicable)
  - Prepare the response with appropriate headers to initiate the download in the user's browser

### 10. (Optional) Additional Functionalities

Implement functionalities for:

- Renaming files/folders
- Moving/copying files/folders within the directory structure
- Sharing files/folders with other users (permission management)
- Deleting files/folders
- Searching for files/folders based on keywords

These functionalities can be implemented by adding new API endpoints and logic in the corresponding controllers.
