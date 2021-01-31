# Seth's Personal Portfolio 😎

The front-end code for [sethwieder.com](http://www.sethwieder.com).

#### Development Setup
    # Confirm Node is installed
    # If not found, go to nodejs.org
    npm -v

    # Install gulp globally
    npm install -g gulp

    # Install project dependencies
    npm install

    # Compile assets and run dev server
    # Run gulp default task
    npm start

#### Production Build
    # Generate production-ready assets
    # Run gulp tasks with `prod` flag
    npm run build

#### Deployment
    # Confirm gcloud CLI is installed
    # If not, [install the SDK](https://cloud.google.com/sdk/docs/install)
    gcloud -v

    # Deploy to AppEngine
    npm run deploy
