# Instructions

## Defining a new section

Create a `package.json` file at the root of your plugin directory. Add a `section` field in the same format as those found in `client/wordpress-com.js`:

```json
{
	"name": "hello-world",
	"section": {
		"name": "hello-world",
		"paths": [ "/hello-world" ],
		"module": "hello-world",
		"group": "sites",
		"secondary": true,
		"enableLoggedOut": true
	}
}
```

## Basic rendering

`index.js` will be assumed to be the entry point to your plugin. That file should export a function that sets up routing for your plugin:

```js
export default function() {
	page( '/hello-world', siteSelection, navigation, renderHelloWorld );
}
```

`renderHelloWorld` itself is responsible for the rendering:

```js
const renderHelloWorld = ( context ) => {
	renderWithReduxStore( (
		<Main>
			<HelloWorld />
		</Main>
	), document.getElementById( 'primary' ), context.store );
};
```

## State


