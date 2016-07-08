/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

const Main = React.createClass( {
	displayName: 'Main',

	render: function() {
		return (
			<main className={ classnames( this.props.className, 'main' ) } role="main">
				{ this.props.children }
			</main>
		);
	}
} );

// Note: not actually hooking anything up yet -- will do that in separate PR
export default connect(
	() => {
		return {};
	},
	() => {
		return {};
	},
)( Main );
