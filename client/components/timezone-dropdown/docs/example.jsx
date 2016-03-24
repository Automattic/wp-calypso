/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import TimezoneDropdown from 'components/timezone-dropdown';
import Card from 'components/card';

export default React.createClass( {

	mixins: [ PureRenderMixin ],

	displayName: 'TimezoneDropdown',

	getInitialState() {
		return {
			timezone: 'UTC+10'
		};
	},

	onTimezoneSelect( timezone ) {
		console.log( 'current zone: %o', timezone );
		this.setState( { timezone: timezone.value } );
	},

	render() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/design/timezone-dropdown">TimezoneDropdown</a>
				</h2>

				<Card style={ { width: '300px', height: '350px', margin: 0 } }>
					<TimezoneDropdown
						selectedZone={ this.state.timezone }
						onSelect={ this.onTimezoneSelect }
					/>
				</Card>

			</div>
		);
	}
} );

