/**
 * External dependencies
 */
import React from 'react/addons';

/**
 * Internal dependencies
 */
import Card from 'components/card';

export default React.createClass( {

	displayName: 'DevWelcome',

	mixins: [ React.addons.PureRenderMixin ],

	render() {
		return (
			<Card className="devdocs__welcome">
				<h1 className="devdocs__welcome-title">Welcome to WP Calypso!</h1>
				<img className="devdocs__welcome-illustration" src="/calypso/images/drake/drake-nosites.svg" />
				<p>This is your local running copy of Calypso. If you want a quick start, check the Guide. To access the documentation at any time, use the small badge in the bottom left corner.</p>
			</Card>
		);
	}
} );
