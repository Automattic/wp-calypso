/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import layoutFocus from 'lib/layout-focus';

const Tailor = React.createClass( {
	componentWillMount() {
		layoutFocus.set( 'design' );
	},

	render() {
		return (
			<div className="tailor">
				<div className="tailor__loading"><h1>{ this.translate( 'Loading' ) }</h1></div>
			</div>
		);
	}
} );

export default Tailor;
