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
			<Card>
				<h1 className="devdocs__welcome-title">Welcome to WP Calypso!</h1>
				<p>This is your local running copy of Calypso. If you want a quick start, check the Guide.</p>
				<p>To access the documentation at any time, use the small badge in the bottom left corner.</p>
			</Card>
		);
	}
} );
