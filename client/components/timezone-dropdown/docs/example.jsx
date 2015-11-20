/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import TimezoneDropdown from 'components/timezone-dropdown';
import Card from 'components/card';

export default React.createClass( {

	mixins: [ React.addons.PureRenderMixin ],

	displayName: 'TimezoneDropdown',

	getInitialState() {
		return {
			timezone: 'Asia/Tokyo'
		};
	},

	onTimezoneSelect( zone ) {
		console.log( `timzone selected: %s`, zone );
		this.setState( { timezone: zone } );
	},

	render() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/design/timezone-dropdown">TimezoneDropdown</a>
				</h2>

				<Card style={ { width: '300px', margin: 0 } }>
					<TimezoneDropdown
						selectedZone={ this.state.timezone }
						onSelect={ this.onTimezoneSelect }
					/>
				</Card>

			</div>
		);
	}
} );

