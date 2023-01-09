import { isEnabled } from '@automattic/calypso-config';
import { Card, Button } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import QuerySiteInvites from 'calypso/components/data/query-site-invites';
import EmptyContent from 'calypso/components/empty-content';
import FormattedHeader from 'calypso/components/formatted-header';
import HeaderCake from 'calypso/components/header-cake';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import PeopleListItem from 'calypso/my-sites/people/people-list-item';
import { deleteInvite } from 'calypso/state/invites/actions';
import {
	isRequestingInvitesForSite,
	getInviteForSite,
	isDeletingInvite,
	didInviteDeletionSucceed,
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
						showStatus={ true }
						RevokeClearBtn={ this.renderClearOrRevoke }
					/>
					{ this.renderInviteDetails() }
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
					<strong>{ translate( 'Invited By' ) }</strong>
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
						illustration="/calypso/images/illustrations/illustration-404.svg"
					/>
				</Main>
			);
		}

		return (
			<Main className="people-invite-details">
				<PageViewTracker path="/people/invites/:site/:invite" title="People > User Details" />
				{ siteId && <QuerySiteInvites siteId={ siteId } /> }

				{ isEnabled( 'user-management-revamp' ) && (
					<FormattedHeader
						brandFont
						className="people__page-heading"
						headerText={ translate( 'Users' ) }
						subHeaderText={ translate(
							'People who have subscribed to your site and team members.'
						) }
						align="left"
						hasScreenOptions
					/>
				) }

				<HeaderCake isCompact onClick={ this.goBack }>
					{ translate( 'User Details' ) }
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
