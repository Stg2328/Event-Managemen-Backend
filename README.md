# Backend API for Event Management System

This is a backend API for managing user authentication and event creation using Express.js, AWS services (Cognito, S3), Sequelize, and the Serverless framework. It supports user registration, login, event creation, file uploads, and email/SMS notifications.

## Features

- **User Authentication**  
  - User registration, login, email/SMS confirmation.
  - Token-based authentication (JWT).
  - Resend confirmation code functionality.
  
- **Event Management**  
  - Create, update, and delete events.
  - Upload and manage event-related files (via AWS S3).
  - List events with pagination, sorting, and search.
  - Send bulk emails to confirmed users when a new event is created.

- **AWS Integration**  
  - AWS Cognito for user management and authentication.
  - AWS S3 for file storage and management.

## Technologies Used

- **Express.js** - Web framework for Node.js.
- **Serverless Framework** - To deploy the app to AWS Lambda.
- **AWS SDK** - For interacting with AWS Cognito and S3.
- **Sequelize** - ORM for managing database models.
- **JWT (JSON Web Token)** - For securing API routes.
- **Multer** - For handling file uploads.
- **CORS** - For handling cross-origin requests.
- **Helmet** - For securing HTTP headers.

## Getting Started

### Prerequisites

Before you begin, make sure you have the following installed on your local machine:

- Node.js (>=12.x)
- AWS CLI (for configuring AWS credentials)
- Serverless Framework (`npm install -g serverless`)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository_url>
   cd <project_folder>
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add the following:

   ```env
   AWS_ACCESS_KEY_ID=<your_aws_access_key>
   AWS_SECRET_ACCESS_KEY=<your_aws_secret_key>
   AWS_REGION=<your_aws_region>
   AWS_S3_BUCKET=<your_s3_bucket_name>
   CLIENT_ID=<your_cognito_client_id>
   CLIENT_SECRET=<your_cognito_client_secret>
   ```

4. Deploy the backend using Serverless:

   ```bash
   sls deploy
   ```

   This will deploy your API to AWS Lambda.

### Endpoints

#### Authentication Routes

- **POST /api/auth/register**  
  Register a new user.

- **POST /api/auth/confirm**  
  Confirm the user's email using the confirmation code.

- **POST /api/auth/login**  
  Log in with the user's credentials.

- **POST /api/auth/resend**  
  Resend the confirmation code to the user's email.

#### Event Routes

- **GET /api/events**  
  List all events with optional search, pagination, and sorting.

- **POST /api/events**  
  Create a new event (requires JWT token). File upload is supported.

- **PUT /api/events/:id**  
  Update an existing event (requires JWT token). File upload is supported.

- **DELETE /api/events/:id**  
  Delete an event (requires JWT token).

- **GET /api/events/:id/download**  
  Generate a pre-signed URL to download an event's file (requires JWT token).

#### Middleware

- **verifyToken** - Middleware to protect routes that require authentication.

### Environment Variables

- `AWS_ACCESS_KEY_ID`: Your AWS Access Key ID.
- `AWS_SECRET_ACCESS_KEY`: Your AWS Secret Access Key.
- `AWS_REGION`: AWS region (e.g., `us-west-2`).
- `AWS_S3_BUCKET`: The S3 bucket name for storing event files.
- `CLIENT_ID`: AWS Cognito Client ID.
- `CLIENT_SECRET`: AWS Cognito Client Secret.

### Testing Locally

To run the app locally, you can use `serverless-offline` to simulate AWS Lambda:

1. Install `serverless-offline`:

   ```bash
   npm install serverless-offline --save-dev
   ```

2. Add the following to your `serverless.yml`:

   ```yaml
   plugins:
     - serverless-offline
   ```

3. Start the offline server:

   ```bash
   sls offline start
   ```

   The API will be available at `http://localhost:3000`.

### Deployment

To deploy the app to AWS Lambda, run:

```bash
sls deploy
```

This will deploy the entire application to AWS, including the API Gateway, Lambda functions, and DynamoDB (if applicable).

### Cleanup

To remove the deployed application from AWS, run:

```bash
sls remove
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
```
