/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import PeopleSectionNav from 'my-sites/people/people-section-nav';
import PeopleListItem from 'my-sites/people/people-list-item';
import Card from 'components/card';
import Gravatar from 'components/gravatar';
import QuerySiteInvites from 'components/data/query-site-invites';
import { isRequestingInvitesForSite, getInvitesForSite } from 'state/invites/selectors';

class PeopleInvites extends React.PureComponent {
	static propTypes = {
		site: PropTypes.object.isRequired,
	};

	renderInvite = invite => {
		// If an invite was sent to a WP.com user, the invite object will have
		// either a display name (if set) or the WP.com username.  Invites can
		// also be sent to any email address, in which case the other details
		// will not be set (but the server will still set `avatar_URL` based on
		// the email).
		const user = invite.user;
		const gravatarUser = pick( user, 'ID', 'display_name', 'avatar_URL' );
		const userNameOrEmail = user.name || user.login || user.email;

		const { site } = this.props;

		return (
			<PeopleListItem
				key={ invite.invite_key }
				user={ user }
				site={ site }
				isSelectable={ false }
			/>
		);

		return (
			<Card key={ invite.invite_key }>
				Invited <Gravatar user={ gravatarUser } /> <strong>{ userNameOrEmail }</strong> as{' '}
				<strong>{ invite.role }</strong>
			</Card>
		);
	};

	render() {
		const { site, requesting, invites } = this.props;

		if ( ! site || ! site.ID ) {
			return null;
		}

		const hasInvites = !! ( invites && invites.length );

		return (
			<Main className="people-invites">
				<QuerySiteInvites siteId={ site.ID } />
				<SidebarNavigation />

				<div>
					<PeopleSectionNav filter="invites" site={ site } />
					{ requesting && ! hasInvites && <Card>Loading invites...</Card> }
					{ hasInvites && invites.map( this.renderInvite ) }
				</div>
			</Main>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const siteId = ownProps.site && ownProps.site.ID;

	return {
		requesting: isRequestingInvitesForSite( state, siteId ),
		invites: getInvitesForSite( state, siteId ),
	};
} )( localize( PeopleInvites ) );
