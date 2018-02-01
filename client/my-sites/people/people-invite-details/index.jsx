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
import Gravatar from 'components/gravatar';
import QuerySiteInvites from 'components/data/query-site-invites';
import EmptyContent from 'components/empty-content';
import { getSelectedSite } from 'state/ui/selectors';
import { isRequestingInvitesForSite, getInviteForSite } from 'state/invites/selectors';

class PeopleInviteDetails extends React.PureComponent {
	static propTypes = {
		site: PropTypes.object,
		inviteKey: PropTypes.string.isRequired,
	};

	goBack = () => {
		const siteSlug = get( this.props, 'site.slug' );
		const fallback = siteSlug ? '/people/invites/' + siteSlug : '/people/invites/';

		// Go back to last route with /people/invites as the fallback
		page.back( fallback );
	};

	renderPlaceholder() {
		return (
			<Card>
				<PeopleListItem key="people-list-item-placeholder" />
			</Card>
		);
	}

	renderInvite() {
		const { site, requesting, invite, translate } = this.props;

		if ( ! site || ! site.ID ) {
			return this.renderPlaceholder();
		}

		if ( ! invite ) {
			if ( requesting ) {
				return this.renderPlaceholder();
			}

			const message = translate( 'The requested invite does not exist.' );
			return <EmptyContent title={ message } />;
		}

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

				{ this.renderInviteDetails() }
			</Card>
		);
	}

	renderInviteDetails() {
		const { invite, translate, moment } = this.props;
		const showName = invite.invitedBy.login !== invite.invitedBy.name;

		return (
			<div className="people-invite-details__meta">
				<div className="people-invite-details__meta-item">
					<span className="people-invite-details__meta-item-label">
						{ translate( 'Invited By' ) }
					</span>
					<Gravatar user={ invite.invitedBy } size={ 24 } />
					{ showName && (
						<span className="people-invite-details__meta-item-user">{ invite.invitedBy.name }</span>
					) }
					<span className="people-invite-details__meta-item-username">
						{ '@' + invite.invitedBy.login }
					</span>
				</div>
				<div className="people-invite-details__meta-item">
					<span className="people-invite-details__meta-item-label">{ translate( 'Sent' ) }</span>
					<span className="people-invite-details__meta-item-date">
						{ moment( invite.inviteDate ).format( 'LLL' ) }
					</span>
				</div>
				{ invite.acceptedDate && (
					<div className="people-invite-details__meta-item">
						<span className="people-invite-details__meta-item-label">
							{ translate( 'Accepted' ) }
						</span>
						<span className="people-invite-details__meta-item-date">
							{ moment( invite.acceptedDate ).format( 'LLL' ) }
						</span>
					</div>
				) }
			</div>
		);
	}

	render() {
		const { site, translate } = this.props;

		return (
			<Main className="people-invite-details">
				{ site && site.ID && <QuerySiteInvites siteId={ site.ID } /> }
				<SidebarNavigation />

				<HeaderCake isCompact onClick={ this.goBack }>
					{ translate( 'Invite Details' ) }
				</HeaderCake>

				{ this.renderInvite() }
			</Main>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const site = getSelectedSite( state );
	const siteId = site && site.ID;

	return {
		site,
		requesting: isRequestingInvitesForSite( state, siteId ),
		invite: getInviteForSite( state, siteId, ownProps.inviteKey ),
	};
} )( localize( PeopleInviteDetails ) );
