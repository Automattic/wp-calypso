/**
 * External dependencies
 */
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestSiteInvites } from 'calypso/state/invites/actions';
import { isRequestingInvitesForSite } from 'calypso/state/invites/selectors';

class QuerySiteInvites extends Component {
	UNSAFE_componentWillMount() {
		this.request( this.props );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
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
