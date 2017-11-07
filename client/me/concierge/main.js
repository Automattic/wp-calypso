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
import { fetchConciergeShifts } from 'state/concierge/actions';
import { getConciergeShifts } from 'state/selectors';

class ConciergeMain extends Component {
	componentDidMount() {
		// TODO: pass in the real WP.com concierge schedule id.
		this.props.fetchConciergeShifts( 123 );
	}

	// TODO: render for real
	render() {
		const { shifts } = this.props;

		if ( ! shifts ) {
			return <div>{ 'Fetching ... please wait.' }</div>;
		}

		return <div>{ JSON.stringify( shifts ) }</div>;
	}
}

export default connect(
	state => ( {
		shifts: getConciergeShifts( state ),
	} ),
	{
		fetchConciergeShifts,
	}
)( localize( ConciergeMain ) );
