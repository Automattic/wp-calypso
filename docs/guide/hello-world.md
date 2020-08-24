# Hello, World!

After learning a bit about the values of the project, let’s get a taste of the codebase and some of the tools.

First [get setup with Calypso locally](../install.md) if you haven't already.

Load [http://calypso.localhost:3000](http://calypso.localhost:3000/) in your browser.

For this example to work, you need to have signed into WordPress **and** have already set up at least one site.

All good? Cool, now let’s build our _Hello, World!_.

## Adding a new section

Sections are usually bigger areas of the application that have their own chunk of code, loaded asynchronously when its URLs are hit.

Creating a new section is composed of five steps:

1. Add your feature `config/development.json`.
2. Setup your section folder `client/my-sites/my-section`.
3. Create a controller `client/my-sites/my-section/controller.js`.
4. Setup the entry routes in `client/my-sites/my-section/index.js`.
5. Register section in `client/sections.js`.

### 1. Add a feature

First thing is to enable your new feature in Calypso. We'll do that by opening `config/development.json` and adding a new feature entry in `features {}`:

```
"hello-world": true
```

Feature flags are a great way to enable/disable certain features in specific environments. For example, we can merge our "Hello, World!" code in `master,` but hide it behind a feature flag. We have [more documentation on feature flags](../../client/config).

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
export const helloWorld = ( context, next ) => {
	console.log( 'Hello, world?' );
	next();
};
```

### 4. Set up the route

The next step is to create the main file for your section, called `index.js` within `hello-world`.
Run the following command to create the file:

```
touch client/my-sites/hello-world/index.js
```

Here we'll import the `page` module, the My Sites controller and our own controller, and write our main route handler:

```javascript
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { makeLayout, render as clientRender } from 'controller';
import { navigation, siteSelection } from 'my-sites/controller';
import { helloWorld } from './controller';

export default () => {
	page(
		'/hello-world/:site?',
		siteSelection,
		navigation,
		helloWorld,
		makeLayout,
		clientRender
	);
};
```

* `page()` will set up the route `/hello-world` and run some functions when it's matched.
* The `:site?` is because we want to support site specific pages for our hello-world route.
* Each function is invoked with `context` and `next` arguments.
* We are passing the `siteSelection` function from the main "My Sites" controller, which handles the site selection process.
* Next, we are passing the `navigation` function, also from the main "My Sites" controller, which inserts the sidebar navigation into `context.secondary`.
* `helloWorld` is our newly created controller handler.
* `makeLayout` creates `Layout` element which contains elements from `context.primary` and `context.secondary`.
* `clientRender` renders `Layout` element into DOM.

You can read more about ES6 modules from Axel Rauschmayer's "[_ECMAScript 6 modules: the final syntax_](http://2ality.com/2014/09/es6-modules-final.html)" as well from _MDN web docs_: [_export_](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export) & [_import_](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import).

### 5. Register section

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

You also need to `require` the `config` module at the top of the `client/sections.js` file (in case the `require` statement is not already there):
```js
const config = require( 'config' );
```
The `sections.js` module needs to be a CommonJS module that uses `require` calls, because it's run by Node.js. ESM imports won't work there at this moment.

Through the use of the `config` module, we are conditionally loading our section only in development environment. All existing sections in `client/sections.js` will load in all environments.

### Run the server!

Restart the server doing:

* `yarn start`

We are ready to load [http://calypso.localhost:3000/hello-world](http://calypso.localhost:3000/hello-world)! Your console should respond with `Hello, world?` if everything is working and you should see Calypso's sidebar for "My Sites".

----

# The View

Now let's build our main view using a React component. For this task we have two steps:

1. Create a JSX file called `main.jsx` in `client/my-sites/hello-world`.
2. Create component's style.scss file.
3. Hook up controller.

### 1. Create main view

Create an empty file `main.jsx` by running the following command:

```
touch client/my-sites/hello-world/main.jsx
```

Start by importing React as an external dependency at the top, then import the internal "Main" UI component from `components/main`. We'll use it to set up our view tree. Finally, create and export a new React Component.

```javascript
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Main from 'components/main';

export default class HelloWorld extends React.Component {

};
```

Cool. Let's make the React component render something for us. We'll do that by adding a `render()` method that uses the "Main" component and outputs some markup. Let's add the `render()` method inside of the `React.Component` extension like so:

```jsx
export default class HelloWorld extends React.Component {
	render() {
		return (
			<Main>
				<h1>Hello, World!</h1>
			</Main>
		);
	}
}
```

If you want to learn more about our approach to writing React components, check out the [Components](../components.md) page.

### 2. Create style.scss file

According to [Components](../components.md) guidelines, there is only one style file per component, it's named `style.scss` and lives in the same component folder.

We'll create an empty `style.scss` file with the following command:

```
touch client/my-sites/hello-world/style.scss
```

Then add some styles for our `HelloWorld` component:

```scss
.hello-world {
	background-color: #fafafa;
}

.hello-world__title {
	color: #37a000;
	font-size: 3rem;
}
```

Let's update the component we wrote above to include our new styles:

```jsx
export default class HelloWorld extends React.Component {
	render() {
		return (
			<Main className="hello-world">
				<h1 className="hello-world__title">Hello, World!</h1>
			</Main>
		);
	}
}
```

We need to do one more step to import the component's style file in the component's JavaScript source file. It's done by adding an import statement block to the `main.jsx` file:

```jsx
/**
 * Style dependencies
 */
import './style.scss';
```

That's it. Please check out the [CSS/Sass Coding Guidelines](../coding-guidelines/css.md) to learn more about working with stylesheets in the project.

### 3. Hook up controller

Time to hook this up with our controller function. Open `/hello-world/controller.js`.
Import React and your new component at the top of the file:

```javascript
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import HelloWorld from 'my-sites/hello-world/main';
```

Then remove the `console.log` call and enter the following instead:

```jsx
export const helloWorld = ( context, next ) => {
	context.primary = <HelloWorld />;
	next();
};
```

In the `Main` constant we are getting our main jsx file for our section. We then place `HelloWorld` element in `context.primary` property, which will be eventually get placed in DOM inside `#primary` div element in `Layout` element.

(If you want to see where `context.primary` is used open `client/layout/index.jsx`.)

### Ok, ready?

Run `yarn start` if it wasn't already running, and load [http://calypso.localhost:3000/hello-world](http://calypso.localhost:3000/hello-world) in your browser. You should see "Hello, World!" on the page next to the sidebar. And since we added `siteSelection` in our initial route setup, changing a site in the sidebar should also work for your hello-world section. Happy _calypsoing_!

Previous: [Values](0-values.md) Next: [The Technology Behind Calypso](tech-behind-calypso.md)
