/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import page from 'page';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import HeaderCake from 'components/header-cake';
import Card from 'components/card';
import PeopleListItem from 'my-sites/people/people-list-item';
import QuerySiteInvites from 'components/data/query-site-invites';
import { getSelectedInvite, isRequestingInvitesForSite } from 'state/invites/selectors';

class PeopleInviteDetails extends React.PureComponent {
	static propTypes = {
		site: PropTypes.object.isRequired,
		inviteKey: PropTypes.string.isRequired,
	};

	goBack = () => {
		const siteSlug = get( this.props, 'site.slug' );
		const fallback = siteSlug ? '/people/invites/' + siteSlug : '/people/invites/';

		// Go back to last route with /people/invites as the fallback
		page.back( fallback );
	};

	renderInvite = () => {
		const { site, invite } = this.props;

		return (
			<Card>
				<PeopleListItem
					key={ invite.key }
					invite={ invite }
					user={ invite.user }
					site={ site }
					type="invite"
					isSelectable={ false }
				/>
			</Card>
		);
	};

	render() {
		const { site, translate, invite } = this.props;

		if ( ! site || ! site.ID ) {
			return null;
		}

		return (
			<Main className="people-invite-details">
				<QuerySiteInvites siteId={ site.ID } />
				<SidebarNavigation />

				<HeaderCake isCompact onClick={ this.goBack }>
					{ translate( 'Invite' ) }
				</HeaderCake>

				{ invite && this.renderInvite() }
			</Main>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const siteId = ownProps.site && ownProps.site.ID;

	return {
		invite: getSelectedInvite( state, siteId, ownProps.inviteKey ),
		requesting: isRequestingInvitesForSite( state, siteId ),
	};
} )( localize( PeopleInviteDetails ) );
