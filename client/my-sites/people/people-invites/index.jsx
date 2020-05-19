/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Gridicon from 'components/gridicon';
import { localize } from 'i18n-calypso';
import { map } from 'lodash';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import EmptyContent from 'components/empty-content';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import FormattedHeader from 'components/formatted-header';
import PeopleListSectionHeader from 'my-sites/people/people-list-section-header';
import PeopleSectionNav from 'my-sites/people/people-section-nav';
import PeopleListItem from 'my-sites/people/people-list-item';
import { Card, Button, Dialog } from '@automattic/components';
import QuerySiteInvites from 'components/data/query-site-invites';
import InvitesListEnd from './invites-list-end';
import { getSelectedSite } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import canCurrentUser from 'state/selectors/can-current-user';
import isPrivateSite from 'state/selectors/is-private-site';
import {
	isRequestingInvitesForSite,
	getPendingInvitesForSite,
	getAcceptedInvitesForSite,
	getNumberOfInvitesFoundForSite,
	isDeletingAnyInvite,
} from 'state/invites/selectors';
import { deleteInvites } from 'state/invites/actions';
import PageViewTracker from 'lib/analytics/page-view-tracker';

/**
 * Style dependencies
 */
import './style.scss';

class PeopleInvites extends React.PureComponent {
	static propTypes = {
		site: PropTypes.object,
	};

	constructor( props ) {
		super( props );
		this.state = {
			showClearAllConfirmation: false,
		};
	}

	toggleClearAllConfirmation = () => {
		this.setState( {
			showClearAllConfirmation: ! this.state.showClearAllConfirmation,
		} );
	};

	handleClearAll = () => {
		const { acceptedInvites, deleting, site } = this.props;

		if ( deleting ) {
			return;
		}

		this.props.deleteInvites( site.ID, map( acceptedInvites, 'key' ) );
		this.toggleClearAllConfirmation();
	};

	render() {
		const { site, canViewPeople, isJetpack, isPrivate, translate } = this.props;
		const siteId = site && site.ID;

		if ( siteId && ! canViewPeople ) {
			return (
				<Main>
					<PageViewTracker path="/people/invites/:site" title="People > Invites" />
					<SidebarNavigation />
					<EmptyContent
						title={ this.props.translate( 'You are not authorized to view this page' ) }
						illustration={ '/calypso/images/illustrations/illustration-404.svg' }
					/>
				</Main>
			);
		}

		return (
			<Main className="people-invites">
				<PageViewTracker path="/people/invites/:site" title="People > Invites" />
				{ siteId && <QuerySiteInvites siteId={ siteId } /> }
				<SidebarNavigation />
				<FormattedHeader
					className="people-invites__page-heading"
					headerText={ translate( 'People' ) }
					align="left"
				/>
				<PeopleSectionNav
					filter="invites"
					site={ site }
					isJetpack={ isJetpack }
					isPrivate={ isPrivate }
				/>
				{ this.renderInvitesList() }
			</Main>
		);
	}

	renderInvitesList() {
		const {
			acceptedInvites,
			pendingInvites,
			totalInvitesFound,
			requesting,
			site,
			translate,
		} = this.props;

		if ( ! site || ! site.ID ) {
			return this.renderPlaceholder();
		}

		const hasAcceptedInvites = acceptedInvites && acceptedInvites.length > 0;
		const acceptedInviteCount = hasAcceptedInvites ? acceptedInvites.length : 0;

		const hasPendingInvites = pendingInvites && pendingInvites.length > 0;
		const pendingInviteCount = hasPendingInvites ? pendingInvites.length : 0;

		if ( ! hasPendingInvites && ! hasAcceptedInvites ) {
			return requesting ? this.renderPlaceholder() : this.renderEmptyContent();
		}

		const pendingLabel = translate(
			'You have a pending invite for %(numberPeople)d user',
			'You have pending invites for %(numberPeople)d users',
			{
				args: {
					numberPeople: pendingInviteCount,
				},
				count: pendingInviteCount,
			}
		);

		const acceptedLabel = translate(
			'%(numberPeople)d user has accepted your invite',
			'%(numberPeople)d users have accepted your invites',
			{
				args: {
					numberPeople: acceptedInviteCount,
				},
				count: acceptedInviteCount,
			}
		);

		return (
			<React.Fragment>
				{ hasPendingInvites && (
					<div className="people-invites__pending">
						<PeopleListSectionHeader label={ pendingLabel } site={ site } />
						<Card className="people-invites__invites-list">
							{ pendingInvites.map( this.renderInvite ) }
						</Card>
					</div>
				) }

				{ hasAcceptedInvites && (
					<div className="people-invites__accepted">
						<PeopleListSectionHeader
							label={ acceptedLabel }
							site={ hasPendingInvites ? null : site }
							// Excluding `site=` hides the "Invite user" link.
						>
							{ this.renderClearAll() }
						</PeopleListSectionHeader>
						<Card className="people-invites__invites-list">
							{ acceptedInvites.map( this.renderInvite ) }
						</Card>
					</div>
				) }

				{ ( hasPendingInvites || hasAcceptedInvites ) && (
					<InvitesListEnd
						shown={ pendingInviteCount + acceptedInviteCount }
						found={ totalInvitesFound }
					/>
				) }
			</React.Fragment>
		);
	}

	renderClearAll() {
		const { deleting, translate } = this.props;

		const dialogButtons = [
			<Button busy={ deleting } primary onClick={ this.handleClearAll }>
				{ translate( 'Clear all' ) }
			</Button>,
			<Button busy={ deleting } onClick={ this.toggleClearAllConfirmation }>
				{ translate( 'Cancel' ) }
			</Button>,
		];

		return (
			<React.Fragment>
				<Button busy={ deleting } compact onClick={ this.toggleClearAllConfirmation }>
					{ translate( 'Clear all accepted' ) }
				</Button>
				<Dialog isVisible={ this.state.showClearAllConfirmation } buttons={ dialogButtons }>
					<h1>{ translate( 'Clear All Accepted' ) }</h1>
					<p>{ translate( 'Are you sure you wish to clear all accepted invites?' ) }</p>
				</Dialog>
			</React.Fragment>
		);
	}

	renderEmptyContent() {
		const emptyTitle = this.props.translate(
			'Invite people to follow your site or help you manage it.'
		);
		return <EmptyContent title={ emptyTitle } action={ this.renderInviteUsersAction() } />;
	}

	renderInviteUsersAction( isPrimary = true ) {
		const { site, translate } = this.props;

		return (
			<Button primary={ isPrimary } href={ `/people/new/${ site.slug }` }>
				<Gridicon icon="user-add" />
				<span>{ translate( 'Invite', { context: 'Verb. Button to invite more users.' } ) }</span>
			</Button>
		);
	}

	renderPlaceholder() {
		return (
			<Card>
				<PeopleListItem key="people-list-item-placeholder" />
			</Card>
		);
	}

	renderInvite = ( invite ) => {
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
}

export default connect(
	( state ) => {
		const site = getSelectedSite( state );
		const siteId = site && site.ID;

		return {
			site,
			isJetpack: isJetpackSite( state, siteId ),
			isPrivate: isPrivateSite( state, siteId ),
			requesting: isRequestingInvitesForSite( state, siteId ),
			pendingInvites: getPendingInvitesForSite( state, siteId ),
			acceptedInvites: getAcceptedInvitesForSite( state, siteId ),
			totalInvitesFound: getNumberOfInvitesFoundForSite( state, siteId ),
			deleting: isDeletingAnyInvite( state, siteId ),
			canViewPeople: canCurrentUser( state, siteId, 'list_users' ),
		};
	},
	{ deleteInvites }
)( localize( PeopleInvites ) );
