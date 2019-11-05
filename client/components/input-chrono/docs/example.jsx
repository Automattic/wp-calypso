/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import InputChrono from 'components/input-chrono';
import Card from 'components/card';

/**
 * Date Picker Demo
 */
const InputChronoExample = localize(
	class extends React.PureComponent {
		state = {
			date: this.props.moment(),
		};

		UNSAFE_componentWillMount() {
			var self = this;
			this.interval = setInterval( function() {
				var date = self.props.moment( self.state.date );
				date.hours( date.hours() + 1 );
				self.setState( { date: date } );
			}, 1000 );
		}

		componentWillUnmount() {
			clearInterval( this.interval );
		}

		onSet = date => {
			console.log( `date: %s`, date.toDate() );
			this.setState( { date: date } );
		};

		render() {
			return (
				<Card style={ { width: '300px', margin: 0 } }>
					<InputChrono value={ this.state.date.calendar() } onSet={ this.onSet } />
				</Card>
			);
		}
	}
);

InputChronoExample.displayName = 'InputChrono';

export default InputChronoExample;
