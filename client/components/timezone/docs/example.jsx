/**
 * External dependencies
 */
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Timezone from 'components/timezone';

export default class TimezoneExample extends PureComponent {
	static displayName = 'TimezoneExample';

	state = {
		timezone: 'America/Argentina/La_Rioja'
	};

	onTimezoneSelect = timezone => {
		this.setState( { timezone } );
	};

	render() {
		return (
			<Card style={ { width: '300px', height: '350px', margin: 0 } }>
				<Timezone
					selectedZone={ this.state.timezone }
					onSelect={ this.onTimezoneSelect }
				/>
			</Card>
		);
	}
}
