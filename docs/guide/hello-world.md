# Hello, World!

After learning a bit about the values of the project, let’s get a taste of the codebase and some of the tools.

First [get setup with Calypso locally](../install.md) if you haven't already.

Load [http://calypso.localhost:3000](http://calypso.localhost:3000/) in your browser. All good? Cool, now let’s build our _Hello, World!_.

## Adding a new section

Sections are usually bigger areas of the application that have their own chunk of code, loaded asyncronously when its URLs is hit.

Creating a new section is composed of five steps:

1. Add your feature `config/development.json`.
2. Setup your section folder.
3. Create a controller `client/my-sites/my-section/controller.js`.
4. Setup the entry routes in `client/my-sites/my-section/index.js`.
5. Register section in `client/sections.js.`

### 1. Add a feature

First thing is to enable your new feature in Calypso. We'll do that by opening `config/development.json` and adding a new feature entry in `features {}`:

```
"hello-world": true
```

Features flags are a great way to enable/disable certain features in specific environments. For example, we can merge our "Hello, World!" code in `master,` but hide it behind a feature flag. We have [more documentation on feature flags](../client/config).

### 2. Set up folder structure

For the sake of this tutorial, we are creating a _Hello World_ page within the my-sites section. Create a directory called `hello-world` in `client/my-sites`.

You can run this command on your terminal within your local Calypso project:

```
mkdir client/my-sites/hello-world
```

### 3. Create a controller file

The `controller.js` file is where you can find the various functions that get called at each specific route. Let's add our own!

```
touch client/my-sites/hello-world/controller.js
```

There you'll write your controller with a function called `helloWorld`:

```javascript
/**
 * External Dependencies
 */
var React = require( 'react' );

const Controller = {
	helloWorld() {
		console.log( 'Hello, world?' );
	}
};

export default Controller;
```

### 4. Setup the route

Next step is to create the main file for your section, called `index.js` within `hello-world`. Run the following command:

```
touch client/my-sites/hello-world/index.js
```

Here we'll require the `page` module, the My Sites controller, our own controller, and write our main route handler:

```javascript
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import controller from 'my-sites/controller';
import helloWorldController from './controller';

export default () => {
	page( '/hello-world/:domain?', controller.siteSelection, controller.navigation, helloWorldController.helloWorld );
};
```

`page()` will set up the route `/hello-world` and run some functions when it's matched. The `:domain?` is because we want to support site specific pages for our hello-world route. We are passing the `siteSelection` function from the main "My Sites" controller, which handles the site selection process. The last function is our newly created controller handler.

### 4. Register section

Now it's time to configure our section. Open `client/sections.js` and add the following code:

```javascript
if ( config.isEnabled( 'hello-world' ) ) {
	sections.push( {
		name: 'hello-world',
		paths: [ '/hello-world' ],
		module: 'my-sites/hello-world'
	} );
}
```

This checks for our feature in the current environment to figure out whether it needs to register a new section. The section is defined by a name, an array with the relevant paths, and the main module.

### Run the server!

Restart the server doing:

* `make run`

We are ready to load [http://calypso.localhost:3000/hello-world](http://calypso.localhost:3000/hello-world)! Your console should respond with `Hello, world?` if everything is working and you should see Calypso's sidebar for "My Sites".

----

# The View

Now let's build our main view using a React component. For this task we have two steps:

1. Create JSX file called `main.jsx` in `client/my-sites/hello-world`.
2. Hook up controller.

### 1. Create main view

Create an empty file `main.jsx` by running the following command:

```
touch client/my-sites/hello-world/main.jsx
```

Start by importing React as an external dependency at the top, then import the internal "Main" UI component from `components/main`. We'll use it to set up our view tree. Finally, create a new React class and set it up with the feature name as its "displayName":

```javascript
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Main from 'components/main';

export default React.createClass( {
	displayName: 'HelloWorld',
} );
```

Cool. Let's make the React component render something for us. We'll do that by adding a `render()` method that uses the "Main" component and outputs some markup. Inside the `React.createClass` object, after "displayName", write:

```javascript
render() {
	return (
		<Main>
			<h1>Hello, World!</h1>
		</Main>
	);
}
```

If you want to learn more about our approach to writing React components, check out the [Components](../components.md) page.

### 2. Hook up controller

Time to hook this up with our controller function. Open `/hello-world/controller.js`. Import React again at the top of the file, then remove the `console.log` call and enter the following instead:

```javascript
helloWorld() {
	const Main = require( 'my-sites/hello-world/main' );

	// Render hello world...
	ReactDom.render(
		React.createElement( Main ),
		document.getElementById( 'primary' )
	);
}
```

In the `Main` constant we are getting our main jsx file for our section. We then instruct React to render `Main` in `#primary`, an element that is already on the DOM.

(If you want to see where `#primary` is created open `client/layout/index.jsx`.)

### Ok, ready?

Run `make run` if it wasn't already running, and load [http://calypso.localhost:3000/hello-world](http://calypso.localhost:3000/hello-world) in your browser. You should see "Hello, World!" on the page next to the sidebar. And since we added `controller.siteSelection` in our initial route setup, changing a site in the sidebar should also work for your hello-world section. Happy _calypsoing_!

Previous: [Values](0-values.md) Next: [The Technology Behind Calypso](tech-behind-calypso.md)
