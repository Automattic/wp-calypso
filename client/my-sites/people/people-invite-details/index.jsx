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
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import HeaderCake from 'calypso/components/header-cake';
import { Card, Button } from '@automattic/components';
import PeopleListItem from 'calypso/my-sites/people/people-list-item';
import Gravatar from 'calypso/components/gravatar';
import QuerySiteInvites from 'calypso/components/data/query-site-invites';
import EmptyContent from 'calypso/components/empty-content';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import {
	isRequestingInvitesForSite,
	getInviteForSite,
	isDeletingInvite,
	didInviteDeletionSucceed,
} from 'calypso/state/invites/selectors';
import { deleteInvite } from 'calypso/state/invites/actions';
import canCurrentUser from 'calypso/state/selectors/can-current-user';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';

/**
 * Style dependencies
 */
import './style.scss';

export class PeopleInviteDetails extends React.PureComponent {
	static propTypes = {
		site: PropTypes.object,
		inviteKey: PropTypes.string.isRequired,
	};

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( nextProps.deleteSuccess && ! this.props.deleteSuccess ) {
			this.goBack();
		}
	}

	goBack = () => {
		const siteSlug = get( this.props, 'site.slug' );
		const fallback = siteSlug ? '/people/invites/' + siteSlug : '/people/invites/';

		// Go back to last route with /people/invites as the fallback
		page.back( fallback );
	};

	handleDelete = () => {
		const { deleting, invite, site } = this.props;
		if ( deleting ) {
			return;
		}
		this.props.deleteInvite( site.ID, invite.key );
	};

	renderClearOrRevoke = () => {
		const { deleting, invite, translate } = this.props;
		const { isPending } = invite;
		const revokeMessage = translate(
			'Revoking an invite will no longer allow this person to become a member of ' +
				'your site. You can always invite them again if you change your mind.'
		);
		const clearMessage = translate(
			'If you no longer wish to see this record, you can clear it. ' +
				'The person will still remain a member of this site.'
		);

		return (
			<div className="people-invite-details__clear-revoke">
				<div>{ isPending ? revokeMessage : clearMessage }</div>
				<Button
					busy={ deleting }
					primary={ isPending }
					scary={ isPending }
					onClick={ this.handleDelete }
				>
					{ isPending ? translate( 'Revoke invite' ) : translate( 'Clear invite' ) }
				</Button>
			</div>
		);
	};

	renderPlaceholder() {
		return (
			<Card>
				<PeopleListItem key="people-list-item-placeholder" />
			</Card>
		);
	}

	renderInvite() {
		const { site, requesting, invite, translate, deleteSuccess } = this.props;

		if ( ! site || ! site.ID || deleteSuccess ) {
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
			<div>
				<Card>
					<PeopleListItem
						key={ invite.key }
						invite={ invite }
						user={ invite.user }
						site={ site }
						type="invite-details"
						isSelectable={ false }
					/>
					{ this.renderInviteDetails() }
				</Card>
				{ this.renderClearOrRevoke() }
			</div>
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
		const { canViewPeople, site, translate } = this.props;
		const siteId = site && site.ID;

		if ( siteId && ! canViewPeople ) {
			return (
				<Main>
					<PageViewTracker path="/people/invites/:site/:invite" title="People > Invite Details" />
					<SidebarNavigation />
					<EmptyContent
						title={ this.props.translate( 'You are not authorized to view this page' ) }
						illustration={ '/calypso/images/illustrations/illustration-404.svg' }
					/>
				</Main>
			);
		}

		return (
			<Main className="people-invite-details">
				<PageViewTracker path="/people/invites/:site/:invite" title="People > Invite Details" />
				{ siteId && <QuerySiteInvites siteId={ siteId } /> }
				<SidebarNavigation />

				<HeaderCake isCompact onClick={ this.goBack }>
					{ translate( 'Invite Details' ) }
				</HeaderCake>

				{ this.renderInvite() }
			</Main>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const site = getSelectedSite( state );
		const siteId = site && site.ID;

		return {
			site,
			requesting: isRequestingInvitesForSite( state, siteId ),
			deleting: isDeletingInvite( state, siteId, ownProps.inviteKey ),
			deleteSuccess: didInviteDeletionSucceed( state, siteId, ownProps.inviteKey ),
			invite: getInviteForSite( state, siteId, ownProps.inviteKey ),
			canViewPeople: canCurrentUser( state, siteId, 'list_users' ),
		};
	},
	{ deleteInvite }
)( localize( withLocalizedMoment( PeopleInviteDetails ) ) );
