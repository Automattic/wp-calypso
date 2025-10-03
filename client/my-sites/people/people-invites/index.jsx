import { Card, Button, Dialog } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { map } from 'lodash';
import PropTypes from 'prop-types';
import { PureComponent, Fragment } from 'react';
import { connect } from 'react-redux';
import QuerySiteInvites from 'calypso/components/data/query-site-invites';
import EmptyContent from 'calypso/components/empty-content';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import PeopleListItem from 'calypso/my-sites/people/people-list-item';
import PeopleListSectionHeader from 'calypso/my-sites/people/people-list-section-header';
import PeopleSectionNav from 'calypso/my-sites/people/people-section-nav';
import { deleteInvites } from 'calypso/state/invites/actions';
import {
	isRequestingInvitesForSite,
	getPendingInvitesForSite,
	getAcceptedInvitesForSite,
	getNumberOfInvitesFoundForSite,
	isDeletingAnyInvite,
} from 'calypso/state/invites/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isEligibleForSubscriberImporter from 'calypso/state/selectors/is-eligible-for-subscriber-importer';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import InviteButton from '../invite-button';
import InvitesListEnd from './invites-list-end';

import './style.scss';

class PeopleInvites extends PureComponent {
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
		const { site, canViewPeople, isJetpack, isPrivate, translate, includeSubscriberImporter } =
			this.props;
		const siteId = site && site.ID;

		if ( siteId && ! canViewPeople ) {
			return (
				<Main>
					<PageViewTracker path="/people/invites/:site" title="People > Invites" />
					<EmptyContent
						title={ this.props.translate( 'You are not authorized to view this page' ) }
					/>
				</Main>
			);
		}

		return (
			<Main className="people-invites">
				<PageViewTracker path="/people/invites/:site" title="People > Invites" />
				{ siteId && <QuerySiteInvites siteId={ siteId } /> }
				<NavigationHeader
					navigationItems={ [] }
					title={ translate( 'Users' ) }
					subtitle={ translate(
						'View and Manage the invites to your site. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
						{
							components: {
								learnMoreLink: (
									<InlineSupportLink key="learnMore" supportContext="invites" showIcon={ false } />
								),
							},
						}
					) }
				/>
				<PeopleSectionNav
					filter="invites"
					site={ site }
					isJetpack={ isJetpack }
					isPrivate={ isPrivate }
					includeSubscriberImporter={ includeSubscriberImporter }
				/>
				{ this.renderInvitesList() }
			</Main>
		);
	}

	renderInvitesList() {
		const { acceptedInvites, pendingInvites, totalInvitesFound, requesting, site, translate } =
			this.props;

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
			<Fragment>
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
			</Fragment>
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
			<Fragment>
				<Button busy={ deleting } compact onClick={ this.toggleClearAllConfirmation }>
					{ translate( 'Clear all accepted' ) }
				</Button>
				<Dialog isVisible={ this.state.showClearAllConfirmation } buttons={ dialogButtons }>
					<h1>{ translate( 'Clear All Accepted' ) }</h1>
					<p>{ translate( 'Are you sure you wish to clear all accepted invites?' ) }</p>
				</Dialog>
			</Fragment>
		);
	}

	renderEmptyContent() {
		const emptyTitle = this.props.translate(
			'Invite people to follow your site or help you manage it.'
		);
		return <EmptyContent title={ emptyTitle } action={ this.renderInviteUsersAction() } />;
	}

	renderInviteUsersAction( isPrimary = true ) {
		const { site, includeSubscriberImporter } = this.props;

		return (
			<InviteButton
				primary={ isPrimary }
				siteSlug={ site.slug }
				includeSubscriberImporter={ includeSubscriberImporter }
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
			includeSubscriberImporter: isEligibleForSubscriberImporter( state ),
		};
	},
	{ deleteInvites }
)( localize( PeopleInvites ) );
