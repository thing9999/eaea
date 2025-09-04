# TypeScript Web Development Project

This project is a TypeScript-based web application that utilizes Webpack for bundling. Below are the instructions for setting up and running the project.

## Project Structure

```
viewer
├── src
│   ├── index.ts
│   └── types
│       └── index.ts
├── public
│   └── index.html
├── package.json
├── tsconfig.json
├── webpack.config.js
└── README.md
```

## Setup Instructions

1. **Clone the Repository**
   Clone this repository to your local machine using:
   ```
   git clone <repository-url>
   ```

2. **Navigate to the Project Directory**
   Change into the project directory:
   ```
   cd viewer
   ```

3. **Install Dependencies**
   Install the required dependencies using npm:
   ```
   npm install
   ```

4. **Build the Project**
   To bundle the TypeScript files, run:
   ```
   npm run build
   ```

5. **Run the Development Server**
   To start the development server, use:
   ```
   npm start
   ```

6. **Open in Browser**
   Open your browser and navigate to `http://localhost:3000` to view the application.

## Usage

- Modify the source files in the `src` directory to implement your application logic.
- Update the `public/index.html` file to change the HTML structure as needed.
- Use the `src/types/index.ts` file to define and export any custom types or interfaces.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.