/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { requestViewers } from 'calypso/state/viewers/actions';
import { connect } from 'react-redux';

class QueryViewers extends React.Component {
	componentDidMount() {
		const { siteId, page, number } = this.props;

		this.props.requestViewers( siteId, { page, number } );
	}

	componentDidUpdate( prevProps ) {
		const { siteId, page, number } = this.props;

		if ( prevProps.page !== page ) {
			this.props.requestViewers( siteId, { page, number } );
		}
	}

	render() {
		return null;
	}
}

export default connect( null, { requestViewers } )( QueryViewers );
