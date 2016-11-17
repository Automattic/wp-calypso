/**
 * External dependencies
 */
import React from 'react';
import { PureComponent } from 'react';
import moment from 'moment';
/**
 * Internal dependencies
 */
import smartSetState from 'lib/react-smart-set-state';
import ticker from 'lib/ticker';
import humanDate from 'lib/human-date';

export default class PostTime extends PureComponent {
	smartSetState = smartSetState;

	componentWillMount() {
		this._update();
	}

	componentDidMount() {
		ticker.on( 'tick', this._update );
	}

	componentWillReceiveProps( nextProps ) {
		this._update( nextProps.date );
	}

	componentWillUnmount() {
		ticker.off( 'tick', this._update );
	}

	_update = date => {
		date = date || this.props.date;
		this.smartSetState( {
			ago: humanDate( date ),
			full: moment( date ).format( 'llll' )
		} );
	}

	render() {
		const date = this.props.date;
		return (
			<time className={ this.props.className } dateTime={ date } title={ this.state.full } >
				{ this.state.ago }
			</time>
		);
	}
}
