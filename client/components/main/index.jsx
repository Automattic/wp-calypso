/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

export default React.createClass( {
	displayName: 'Main',

	render: function() {
		return (
			<main className={ classnames( this.props.className, 'main' ) } role="main">
				{ this.props.children }
			</main>
		);
	}
} );
