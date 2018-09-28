# Preflight

This is a NodeJS app without dependency on other tech other than NPM modules.

To setup just run:

	$ npm install

# Server

To start the server run:

	$ [port=3000] grunt server

It will listen on port 3000 by defualt. The port can optionally be changed through an env var.

The server caches data within a mock DB defined under db.js. Every time the server restarts the state is lost.

# Testing

For quick testing while developing there is a sample curl request just above the definition of each API route.

There is also unit tests suite under spec/appSpec.js to exercise calls to the API interface. After starting the server run the following command to run the tests:

	$ npm run test

# Assumptions
	When storing new session data all properties within the request body are required to keep data uniform within the mock DB.