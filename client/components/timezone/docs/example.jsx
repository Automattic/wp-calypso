/**
 * External dependencies
 */
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import Timezone from 'components/timezone';
import Card from 'components/card';

export default class extends PureComponent {
    static displayName = 'Timezone';

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
