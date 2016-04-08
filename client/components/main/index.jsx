/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react'
import classnames from 'classnames';

const Main = React.createClass( {
	render() {
		return (
			<main className={ classnames( this.props.className, 'main' ) } role="main">
				{ this.props.children }
			</main>
		);
	}
} );

export default Main;
