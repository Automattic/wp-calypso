/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import moment from 'moment';

/**
 * Internal dependencies
 */
import humanDate from 'lib/human-date';
import { Interval, EVERY_TEN_SECONDS } from 'lib/interval';
import smartSetState from 'lib/react-smart-set-state';

export default class TimeSince extends PureComponent {
	smartSetState = smartSetState;

	UNSAFE_componentWillMount() {
		this.update();
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		this.update( nextProps.date );
	}

	update = ( date ) => {
		const { dateFormat } = this.props;
		date = date || this.props.date;

		this.smartSetState( {
			humanDate: humanDate( date, dateFormat ),
			fullDate: moment( date ).format( 'llll' ),
		} );
	};

	render() {
		return (
			<time
				className={ this.props.className }
				dateTime={ this.props.date }
				title={ this.state.fullDate }
			>
				<Interval period={ EVERY_TEN_SECONDS } onTick={ this.update } />
				{ this.state.humanDate }
			</time>
		);
	}
}
