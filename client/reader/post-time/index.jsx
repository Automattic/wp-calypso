/** @format */
/**
 * External dependencies
 */
import moment from 'moment';
import React from 'react';
import { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import humanDate from 'lib/human-date';
import smartSetState from 'lib/react-smart-set-state';
import ticker from 'lib/ticker';

export default class PostTime extends PureComponent {
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
		date = date || this.props.date;
		this.smartSetState( {
			humanDate: humanDate( date ),
			fullDate: moment( date ).format( 'llll' ),
		} );
	};

	render() {
		const date = this.props.date;
		return (
			<time className={ this.props.className } dateTime={ date } title={ this.state.fullDate }>
				{ this.state.humanDate }
			</time>
		);
	}
}
