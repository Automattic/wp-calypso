/** @format */

/**
 * External dependencies
 */
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestSiteInvites } from 'state/invites/actions';
import { isRequestingInvitesForSite } from 'state/invites/selectors';

class QuerySiteInvites extends Component {
	componentWillMount() {
		this.request( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId === nextProps.siteId ) {
			return;
		}

		this.request( nextProps );
	}

	request( props ) {
		if ( props.requesting || ! props.siteId ) {
			return;
		}

		props.requestSiteInvites( props.siteId );
	}

	render() {
		return null;
	}
}

export default connect(
	( state, ownProps ) => {
		const { siteId } = ownProps;
		return {
			requesting: isRequestingInvitesForSite( state, siteId ),
		};
	},
	{ requestSiteInvites }
)( QuerySiteInvites );
