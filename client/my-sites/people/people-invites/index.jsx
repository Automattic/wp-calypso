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
import EmptyContent from 'components/empty-content';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import PeopleListSectionHeader from 'my-sites/people/people-list-section-header';
import PeopleSectionNav from 'my-sites/people/people-section-nav';
import PeopleListItem from 'my-sites/people/people-list-item';
import Card from 'components/card';
import QuerySiteInvites from 'components/data/query-site-invites';
import InvitesListEnd from './invites-list-end';
import {
	isRequestingInvitesForSite,
	getInvitesForSite,
	getNumberOfInvitesFoundForSite,
} from 'state/invites/selectors';

class PeopleInvites extends React.PureComponent {
	static propTypes = {
		site: PropTypes.object.isRequired,
	};

	renderInvite = invite => {
		const user = invite.user;

		const { site } = this.props;

		return (
			<PeopleListItem
				key={ invite.key }
				invite={ invite }
				user={ user }
				site={ site }
				type="invite"
				isSelectable={ false }
			/>
		);
	};

	renderEmptyContent() {
		const { site, translate } = this.props;

		return (
			<EmptyContent
				title={ translate( "You haven't sent any invites yet." ) }
				action={ translate( 'Send Invite' ) }
				actionURL={ `/people/new/${ site.slug }` }
			/>
		);
	}

	renderPlaceholder() {
		return (
			<Card>
				<PeopleListItem key="people-list-item-placeholder" />
			</Card>
		);
	}

	render() {
		const { invites, invitesFound, requesting, site, translate } = this.props;

		if ( ! site || ! site.ID ) {
			return null;
		}

		const hasInvites = !! ( invites && invites.length );
		const count = ( ! requesting && hasInvites && invites.length ) || null;
		const showPlaceholder = requesting && ! hasInvites;
		const showEmptyContent = ! requesting && ! hasInvites;
		const showSectionHeader = requesting || hasInvites;

		return (
			<Main className="people-invites">
				<QuerySiteInvites siteId={ site.ID } />
				<SidebarNavigation />

				<div>
					<PeopleSectionNav filter="invites" site={ site } />

					{ showSectionHeader && (
						<PeopleListSectionHeader
							label={ translate( 'Invites' ) }
							site={ site }
							count={ count }
						/>
					) }
					{ showPlaceholder && this.renderPlaceholder() }
					{ showEmptyContent && this.renderEmptyContent() }
					{ hasInvites && <Card>{ invites.map( this.renderInvite ) }</Card> }
					{ hasInvites && <InvitesListEnd found={ invitesFound } /> }
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
		invitesFound: getNumberOfInvitesFoundForSite( state, siteId ),
	};
} )( localize( PeopleInvites ) );
