import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Card, Button } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import QuerySiteInvites from 'calypso/components/data/query-site-invites';
import EmptyContent from 'calypso/components/empty-content';
import HeaderCake from 'calypso/components/header-cake';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import InviteStatus from 'calypso/my-sites/people/invite-status';
import PeopleListItem from 'calypso/my-sites/people/people-list-item';
import { deleteInvite, resendInvite } from 'calypso/state/invites/actions';
import {
	isRequestingInvitesForSite,
	getInviteForSite,
	isDeletingInvite,
	didInviteDeletionSucceed,
	isRequestingInviteResend,
	didInviteResendSucceed,
} from 'calypso/state/invites/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { getSelectedSite } from 'calypso/state/ui/selectors';

import './style.scss';

export class PeopleInviteDetails extends PureComponent {
	static propTypes = {
		site: PropTypes.object,
		inviteKey: PropTypes.string.isRequired,
	};

	componentDidUpdate( prevProps ) {
		if ( this.props.deleteSuccess && ! prevProps.deleteSuccess ) {
			this.goBack();
		}
	}

	goBack = () => {
		const siteSlug = get( this.props, 'site.slug' );
		const route = isEnabled( 'user-management-revamp' ) ? 'team-members' : 'invites';
		const fallback = siteSlug ? `/people/${ route }/${ siteSlug }` : `/people/${ route }/`;

		// Go back to last route with provided route as the fallback
		page.back( fallback );
	};

	onResend = ( event ) => {
		const { requestingResend, resendSuccess, invite, site } = this.props;
		// Prevents navigation to invite-details screen and onClick event.
		event.preventDefault();
		event.stopPropagation();

		if ( requestingResend || resendSuccess ) {
			return null;
		}

		this.props.resendInvite( site.ID, invite.key );
	};

	handleDelete = () => {
		const { deleting, invite, site } = this.props;
		if ( deleting ) {
			return;
		}
		this.props.deleteInvite( site.ID, invite.key );
	};

	renderClearOrRevoke = ( props = {} ) => {
		const { deleting, invite, translate } = this.props;
		const { isPending } = invite;

		return (
			<Button className={ props.className || '' } busy={ deleting } onClick={ this.handleDelete }>
				{ isPending ? translate( 'Revoke' ) : translate( 'Clear' ) }
			</Button>
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
		const {
			site,
			requesting,
			invite,
			translate,
			requestingResend,
			resendSuccess,
			inviteWasDeleted,
			deletingInvite,
		} = this.props;

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
					<InviteStatus
						type="invite-details"
						invite={ invite }
						site={ site }
						requestingResend={ requestingResend }
						resendSuccess={ resendSuccess }
						inviteWasDeleted={ inviteWasDeleted }
						deletingInvite={ deletingInvite }
						handleDelete={ this.handleDelete }
						onResend={ this.onResend }
					/>
				</Card>
			</div>
		);
	}

	renderInviteDetails() {
		const { invite, translate, moment } = this.props;
		const showName = invite.invitedBy.login !== invite.invitedBy.name;

		return (
			<div className="people-invite-details__meta">
				<div className="people-invite-details__meta-item">
					<strong>{ translate( 'Status' ) }</strong>
					<div>
						{ invite.isPending && (
							<span className="people-invite-details__meta-status-pending">
								{ translate( 'Pending' ) }
							</span>
						) }
						{ !! invite.acceptedDate && (
							<span className="people-invite-details__meta-status-active">
								{ translate( 'Active' ) }
							</span>
						) }
					</div>
				</div>
				<div className="people-invite-details__meta-item">
					<strong>{ translate( 'Added By' ) }</strong>
					<div>
						<span>
							{ showName && <>{ invite.invitedBy.name }</> } { '@' + invite.invitedBy.login }
						</span>
					</div>
				</div>

				<div className="people-invite-details__meta-item">
					<strong>{ translate( 'Invite date' ) }</strong>
					<div>{ moment( invite.inviteDate ).format( 'LLL' ) }</div>
				</div>
			</div>
		);
	}

	render() {
		const { canViewPeople, site, translate } = this.props;
		const siteId = site && site.ID;

		if ( siteId && ! canViewPeople ) {
			return (
				<Main>
					<PageViewTracker path="/people/invites/:site/:invite" title="People > User Details" />
					<EmptyContent
						title={ this.props.translate( 'You are not authorized to view this page' ) }
					/>
				</Main>
			);
		}

		return (
			<Main className="people-invite-details">
				<PageViewTracker path="/people/invites/:site/:invite" title="People > User Details" />
				{ siteId && <QuerySiteInvites siteId={ siteId } /> }

				<HeaderCake onClick={ this.goBack }>{ translate( 'User Details' ) }</HeaderCake>

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
			requestingResend: isRequestingInviteResend( state, siteId, ownProps.inviteKey ),
			resendSuccess: didInviteResendSucceed( state, siteId, ownProps.inviteKey ),
			inviteWasDeleted: didInviteDeletionSucceed( state, siteId, ownProps.inviteKey ),
			deletingInvite: isDeletingInvite( state, siteId, ownProps.inviteKey ),
		};
	},
	{ deleteInvite, resendInvite }
)( localize( withLocalizedMoment( PeopleInviteDetails ) ) );
