Stylizer
========

`Stylizer` is a very simple library that is used in conjunction with the [isomorphic style loader](https://github.com/kriasoft/isomorphic-style-loader/) for Webpack and [React](https://facebook.github.io/react/). This loader picks up the output of previous loaders (usually a CSS loader) and injects the CSS into the page. `Stylizer` simplifies the use of this loader with React applications. 

To be more specific, `Stylizer` provides the function specified via the `onInsertCss` prop to all child components. It makes use of the [React context](https://facebook.github.io/react/docs/context.html) so you don't have to pass this function down manually at every level in the component tree. Each component should be decorated with the `withStyles` higher-order component provided by the loader. 


### Client-side

You should use the provided `insertCss()` function when rendering on the client:

```
import Stylizer, { insertCss } from 'lib/stylizer';
...

function render() {
	...

	ReactDOM.render(
		<Provider store={ store }>
			<Stylizer onInsertCss={ insertCss }>
				<App history={ history } />
			</Stylizer>
		</Provider>,
		document.getElementById( 'content' )
	);
}
```


### Server-side

It's your responsibility to provide a function to retrieve the styles when rendering on the server. You'll then have to inject these styles in the template of your page:

```
import curry from 'lodash/curry';
import Stylizer, { addCss } from 'lib/stylizer';
...

function render() {
	...

	const css = [];
	
	const content = renderToString(
		<Provider store={ store }>
			<Stylizer onInsertCss={ curry( addCss )( css ) }>
				<RouterContext { ...props } />
			</Stylizer>
		</Provider>
	);

	response.send( template( { content, css: css.join( '' ) } ) );
}
```


### Components

Any component with styles should be wrapped with the `withStyles` function. The latter will retrieve the function provided to `Stylizer` from the React context and use it to aggregate all the styles:

```
import React from 'react';
import styles from './styles.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

const MyComponent = React.createClass( {
	render() {
		return (
			<div className={ styles.container }>
				<h1 className={ styles.heading }>Hello world!</h1>
			</div>
		);
	}
} );

export default withStyles( styles )( MyComponent );
```