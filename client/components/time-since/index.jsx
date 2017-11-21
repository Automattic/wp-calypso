/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import moment from 'moment';

/**
 * Internal dependencies
 */
import smartSetState from 'lib/react-smart-set-state';
import ticker from 'lib/ticker';
import humanDate from 'lib/human-date';

export default class TimeSince extends PureComponent {
	smartSetState = smartSetState;

	componentWillMount() {
		this.update();
	}

	componentDidMount() {
		ticker.on( 'tick', this.update );
	}

	componentWillReceiveProps( nextProps ) {
		this.update( nextProps.date );
	}

	componentWillUnmount() {
		ticker.off( 'tick', this.update );
	}

	update = date => {
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
				{ this.state.humanDate }
			</time>
		);
	}
}
