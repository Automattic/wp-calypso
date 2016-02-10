import React from 'react';
import { render } from 'react-dom';
import { Router, Route, Link, browserHistory } from 'react-router';

import Layout from 'layout';
import Design from 'my-sites/themes';

const App = React.createClass( {
	render() {
		return (
			<Layout primary={ this.props.children } />
		);
	}
} );

render( (
	<Router>
		<Route path="/" component={ App } >
			<Route path="design" component={ Design } />
		</Route>
	</Router>
), document.getElementById( 'wpcom' ) );
