/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import QueryConciergeShifts from 'components/data/query-concierge-shifts';
import { getConciergeShifts } from 'state/selectors';

class ConciergeMain extends Component {
	render() {
		const { shifts } = this.props;

		// TODO:
		// 1. pass in the real scheduleId for WP.com concierge schedule.
		// 2. render the shifts for real.
		return (
			<div>
				<QueryConciergeShifts scheduleId={ 123 } />
				<div>{ JSON.stringify( shifts ) }</div>
			</div>
		);
	}
}

export default connect(
	state => ( {
		shifts: getConciergeShifts( state ),
	} ),
	{ getConciergeShifts }
)( localize( ConciergeMain ) );
