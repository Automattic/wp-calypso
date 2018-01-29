/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import PeopleListSectionHeader from 'my-sites/people/people-list-section-header';
import QuerySiteInvites from 'components/data/query-site-invites';
import { getSelectedInvite, isRequestingInvitesForSite } from 'state/invites/selectors';

class PeopleInviteDetails extends React.PureComponent {
	static propTypes = {
		site: PropTypes.object.isRequired,
		inviteKey: PropTypes.string.isRequired,
	};

	render() {
		const { selectedInvite, requesting, site, translate } = this.props;

		if ( ! site || ! site.ID ) {
			return null;
		}

		const hasInvite = selectedInvite;
		const showSectionHeader = requesting || hasInvite;

		return (
			<Main className="people-invite-details">
				<QuerySiteInvites siteId={ site.ID } />
				<SidebarNavigation />

				<div>
					{ showSectionHeader && (
						<PeopleListSectionHeader label={ translate( 'Invite' ) } site={ site } />
					) }
					{ /*console.log( this.props.selectedInvite )*/ }
				</div>
			</Main>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const siteId = ownProps.site && ownProps.site.ID;

	return {
		selectedInvite: getSelectedInvite( state, siteId, ownProps.inviteKey ),
		requesting: isRequestingInvitesForSite( state, siteId ),
	};
} )( localize( PeopleInviteDetails ) );
