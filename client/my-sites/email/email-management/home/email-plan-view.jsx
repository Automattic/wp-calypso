/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { CompactCard } from '@automattic/components';
import page from 'page';

/**
 * Internal dependencies
 */
import wp from 'calypso/lib/wp';
import { hasEmailForwards } from 'calypso/lib/domains/email-forwarding';
import { hasGSuiteWithUs } from 'calypso/lib/gsuite';
import { hasTitanMailWithUs } from 'calypso/lib/titan';
import SectionHeader from 'calypso/components/section-header';
import HeaderCake from 'calypso/components/header-cake';
import VerticalNav from 'calypso/components/vertical-nav';
import VerticalNavItem from 'calypso/components/vertical-nav/item';
import EmailTypeIcon from 'calypso/my-sites/email/email-management/home/email-type-icon';
import MaterialIcon from 'calypso/components/material-icon';
import Badge from 'calypso/components/badge';
import getGSuiteUsers from 'calypso/state/selectors/get-gsuite-users';
import { getEmailForwards } from 'calypso/state/selectors/get-email-forwards';
import QueryEmailForwards from 'calypso/components/data/query-email-forwards';
import { emailManagement } from 'calypso/my-sites/email/paths';

class EmailPlanView extends React.Component {
	state = {
		isLoadingTitanMailboxes: false,
		errorLoadingTitanMailboxes: false,
		loadedTitanMailboxes: false,
		titanMailboxes: [],
	};

	componentDidMount() {
		this.loadTitanMailboxes();
	}

	componentDidUpdate() {
		this.loadTitanMailboxes();
	}

	loadTitanMailboxes() {
		const { selectedSite } = this.props;

		if ( this.state.isLoadingTitanMailboxes || this.state.loadedTitanMailboxes ) {
			return;
		}

		this.setState( {
			isLoadingTitanMailboxes: true,
		} );

		wp.undocumented()
			.getTitanMailboxesForSite( selectedSite.ID )
			.then(
				( data ) => {
					this.setState( {
						isLoadingTitanMailboxes: false,
						errorLoadingTitanMailboxes: false,
						loadedTitanMailboxes: true,
						titanMailboxes: data?.accounts || [],
					} );
				},
				() => {
					this.setState( {
						isLoadingTitanMailboxes: false,
						errorLoadingTitanMailboxes: true,
						loadedTitanMailboxes: true,
						titanMailboxes: [],
					} );
				}
			);
	}

	getEmails() {
		const { domain, emails } = this.props;

		if ( hasTitanMailWithUs( domain ) ) {
			return this.state.titanMailboxes;
		}

		return emails;
	}

	renderEmailsList() {
		const { translate } = this.props;

		const emails = this.getEmails();

		if ( ! emails || emails.length < 1 ) {
			return;
		}

		const emailsItems = emails.map( ( email ) => {
			return (
				<CompactCard
					key={ `email-row-${ email.email }` }
					className="email-plan-view__mailbox-list-item"
				>
					<MaterialIcon icon="email" />
					<span>{ email.email }</span>
					{ email.isAdmin && <Badge type="info">{ translate( 'Admin' ) }</Badge> }
				</CompactCard>
			);
		} );

		return (
			<div className="email-plan-view__mailbox-list">
				<SectionHeader label={ translate( 'Mailboxes' ) } />
				{ emailsItems }
			</div>
		);
	}

	handleBack = () => {
		const { selectedSite } = this.props;
		page( emailManagement( selectedSite.slug ) );
	};

	render() {
		const { domain } = this.props;

		return (
			<React.Fragment>
				{ domain && <QueryEmailForwards domainName={ domain.name } /> }
				<HeaderCake onClick={ this.handleBack }>Email plan settings</HeaderCake>
				<CompactCard className="email-plan-view__general">
					<span className="email-plan-view__general-icon">
						<EmailTypeIcon domain={ domain } />
					</span>
					<div>
						<h2>@{ domain.name }</h2>
						<span>[ status_icon ] Status</span>
					</div>
				</CompactCard>
				<CompactCard>Expires: date [renew now] [auto renew]</CompactCard>

				{ this.renderEmailsList() }

				<VerticalNav>
					<VerticalNavItem path="a">Add new mailbox</VerticalNavItem>
				</VerticalNav>
			</React.Fragment>
		);
	}
}

const normalizeGsuiteUsers = ( gsuiteUsers ) => {
	if ( ! gsuiteUsers || ! Array.isArray( gsuiteUsers ) ) {
		return [];
	}
	return gsuiteUsers.map( ( gsuiteUser ) => {
		return {
			email: gsuiteUser.email,
			isAdmin: gsuiteUser.is_admin,
		};
	} );
};

const normalizeEmailForwardingAddresses = ( emailForwards ) => {
	if ( ! emailForwards || ! Array.isArray( emailForwards ) ) {
		return [];
	}
	return emailForwards.map( ( emailForward ) => {
		return {
			email: emailForward.email,
			isAdmin: false,
		};
	} );
};

function filterEmailListByDomain( emailList, domainName ) {
	return emailList.filter( ( email ) => domainName === email.domain );
}

export default connect( ( state, ownProps ) => {
	const selectedSiteId = ownProps.selectedSite?.ID;

	let emails = [];
	if ( hasGSuiteWithUs( ownProps.domain ) ) {
		const gsuiteUsersForSite = getGSuiteUsers( state, selectedSiteId ) ?? [];
		const gsuiteUsers = filterEmailListByDomain( gsuiteUsersForSite, ownProps.domain?.name );

		emails = normalizeGsuiteUsers( gsuiteUsers );
	} else if ( hasEmailForwards( ownProps.domain ) ) {
		const emailForwards = getEmailForwards( state, ownProps.domain?.name ) ?? [];
		emails = normalizeEmailForwardingAddresses( emailForwards );
	} else if ( hasTitanMailWithUs( ownProps.domain ) ) {
		emails = []; // filterEmailListByDomain( ownProps.titanMailboxes, ownProps.domain?.name );
	}

	return {
		emails,
	};
} )( localize( EmailPlanView ) );
