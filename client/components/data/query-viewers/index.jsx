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
const DEFAULT_PAGE = 1;

class QueryViewers extends React.Component {
	componentDidMount() {
		this.request();
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.page !== this.props.page ) {
			this.request();
		}
	}

	request() {
		this.props.requestViewers(
			this.props.siteId,
			this.props.page ?? DEFAULT_PAGE,
			DEFAULT_NUMBER_OF_VIEWERS
		);
	}

	render() {
		return null;
	}
}

export default connect( null, { requestViewers } )( QueryViewers );
