/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { requestViewers } from 'calypso/state/viewers/actions';
import { connect } from 'react-redux';

const DEFAULT_NUMBER_OF_VIEWERS = 100;

class QueryViewers extends React.Component {
	componentDidMount() {
		this.props.requestViewers( this.props.siteId, this.getQuery() );
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.page !== this.props.page ) {
			this.props.requestViewers( this.props.siteId, this.getQuery() );
		}
	}

	getQuery() {
		return {
			page: this.props.page,
			number: this.props.number ?? DEFAULT_NUMBER_OF_VIEWERS,
		};
	}

	render() {
		return null;
	}
}

export default connect( null, { requestViewers } )( QueryViewers );
