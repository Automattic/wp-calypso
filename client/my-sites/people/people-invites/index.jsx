/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { map } from 'lodash';

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
import Button from 'components/button';
import QuerySiteInvites from 'components/data/query-site-invites';
import Dialog from 'components/dialog';
import InvitesListEnd from './invites-list-end';
import { getSelectedSite } from 'state/ui/selectors';
import {
	isRequestingInvitesForSite,
	getPendingInvitesForSite,
	getAcceptedInvitesForSite,
	getNumberOfInvitesFoundForSite,
	isDeletingAnyInvite,
} from 'state/invites/selectors';
import { deleteInvites } from 'state/invites/actions';

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
		const { site } = this.props;
		const siteId = site && site.ID;

		return (
			<Main className="people-invites">
				{ siteId && <QuerySiteInvites siteId={ siteId } /> }
				<SidebarNavigation />
				<PeopleSectionNav filter="invites" site={ site } />
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
		const acceptedInviteCount = hasAcceptedInvites ? acceptedInvites.length : null;

		const hasPendingInvites = pendingInvites && pendingInvites.length > 0;
		const pendingInviteCount = hasPendingInvites ? pendingInvites.length : null;

		if ( ! hasPendingInvites && ! hasAcceptedInvites ) {
			return requesting ? this.renderPlaceholder() : this.renderEmptyContent();
		}

		return (
			<React.Fragment>
				{ hasPendingInvites ? (
					<div className="people-invites__pending">
						<PeopleListSectionHeader
							label={ translate( 'Pending' ) }
							count={ pendingInviteCount }
							site={ site }
						/>
						<Card>{ pendingInvites.map( this.renderInvite ) }</Card>
					</div>
				) : (
					<div className="people-invites__pending">{ this.renderInviteUsersAction( false ) }</div>
				) }

				{ hasAcceptedInvites && (
					<div className="people-invites__accepted">
						<PeopleListSectionHeader
							label={ translate( 'Accepted' ) }
							count={ acceptedInviteCount }
							// Excluding `site=` hides the "Invite user" link.
						>
							{ this.renderClearAll() }
						</PeopleListSectionHeader>
						<Card>{ acceptedInvites.map( this.renderInvite ) }</Card>
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
				{ translate( 'Clear All' ) }
			</Button>,
			<Button busy={ deleting } onClick={ this.toggleClearAllConfirmation }>
				{ translate( 'Cancel' ) }
			</Button>,
		];

		return (
			<React.Fragment>
				<Button busy={ deleting } compact onClick={ this.toggleClearAllConfirmation }>
					{ translate( 'Clear All Accepted' ) }
				</Button>
				<Dialog isVisible={ this.state.showClearAllConfirmation } buttons={ dialogButtons }>
					<h1>{ translate( 'Clear All Accepted' ) }</h1>
					<p>{ translate( 'Are you sure you wish to clear all accepted invites?' ) }</p>
				</Dialog>
			</React.Fragment>
		);
	}

	renderEmptyContent() {
		return <EmptyContent title={ null } action={ this.renderInviteUsersAction() } />;
	}

	renderInviteUsersAction( isPrimary = true ) {
		const { site, translate } = this.props;

		return (
			<div className="people-invites__invite-users-action">
				<div className="people-invites__invite-users-message">
					{ translate( 'Invite people to follow your site or help you manage it.' ) }
				</div>
				<Button primary={ isPrimary } href={ `/people/new/${ site.slug }` }>
					<Gridicon icon="user-add" />
					{ translate( 'Invite user', { context: 'button label' } ) }
				</Button>
			</div>
		);
	}

	renderPlaceholder() {
		return (
			<Card>
				<PeopleListItem key="people-list-item-placeholder" />
			</Card>
		);
	}

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
}

export default connect(
	state => {
		const site = getSelectedSite( state );
		const siteId = site && site.ID;

		return {
			site,
			requesting: isRequestingInvitesForSite( state, siteId ),
			pendingInvites: getPendingInvitesForSite( state, siteId ),
			acceptedInvites: getAcceptedInvitesForSite( state, siteId ),
			totalInvitesFound: getNumberOfInvitesFoundForSite( state, siteId ),
			deleting: isDeletingAnyInvite( state, siteId ),
		};
	},
	{ deleteInvites }
)( localize( PeopleInvites ) );
