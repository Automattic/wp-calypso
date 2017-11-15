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
import QueryConciergeSlots from 'components/data/query-concierge-slots';
import { getConciergeSlots } from 'state/selectors';

class ConciergeMain extends Component {
	render() {
		const { slots } = this.props;

		// TODO:
		// 1. pass in the real scheduleId for WP.com concierge schedule.
		// 2. render the slots for real.
		return (
			<div>
				<QueryConciergeSlots scheduleId={ 123 } />
				<div>{ JSON.stringify( slots ) }</div>
			</div>
		);
	}
}

export default connect(
	state => ( {
		slots: getConciergeSlots( state ),
	} ),
	{ getConciergeSlots }
)( localize( ConciergeMain ) );
