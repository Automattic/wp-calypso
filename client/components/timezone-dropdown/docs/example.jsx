/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import DocsExample from 'components/docs-example';
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
			<DocsExample
				title="TimezoneDropdown"
				url="/devdocs/design/timezone-dropdown"
				componentUsageStats={ this.props.getUsageStats( TimezoneDropdown ) }
			>
				<Card style={ { width: '300px', height: '350px', margin: 0 } }>
					<TimezoneDropdown
						selectedZone={ this.state.timezone }
						onSelect={ this.onTimezoneSelect }
					/>
				</Card>
			</DocsExample>
		);
	}
} );

