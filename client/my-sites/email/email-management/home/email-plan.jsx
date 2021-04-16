/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { CompactCard } from '@automattic/components';
import page from 'page';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import wp from 'calypso/lib/wp';
import { hasEmailForwards } from 'calypso/lib/domains/email-forwarding';
import { hasGSuiteWithUs } from 'calypso/lib/gsuite';
import { hasTitanMailWithUs } from 'calypso/lib/titan';
import HeaderCake from 'calypso/components/header-cake';
import VerticalNav from 'calypso/components/vertical-nav';
import VerticalNavItem from 'calypso/components/vertical-nav/item';
import EmailTypeIcon from 'calypso/my-sites/email/email-management/home/email-type-icon';
import getGSuiteUsers from 'calypso/state/selectors/get-gsuite-users';
import { getEmailForwards } from 'calypso/state/selectors/get-email-forwards';
import QueryEmailForwards from 'calypso/components/data/query-email-forwards';
import { emailManagement } from 'calypso/my-sites/email/paths';
import EmailPlanMailboxesList from 'calypso/my-sites/email/email-management/home/email-plan-mailboxes-list';
import {
	getByPurchaseId,
	hasLoadedSitePurchasesFromServer,
	isFetchingSitePurchases,
} from 'calypso/state/purchases/selectors';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import EmailPlanSubscription from 'calypso/my-sites/email/email-management/home/email-plan-subscription';
import MaterialIcon from 'calypso/components/material-icon';
import { resolveEmailPlanStatus } from 'calypso/my-sites/email/email-management/home/utils';

class EmailPlan extends React.Component {
	state = {
		isLoadingEmailAccounts: false,
		errorLoadingEmailAccounts: false,
		loadedEmailAccounts: false,
		emailAccounts: [],
	};

	componentDidMount() {
		this.loadEmailAccounts();
	}

	componentDidUpdate() {
		this.loadEmailAccounts();
	}

	loadEmailAccounts() {
		const { domain, selectedSite } = this.props;

		if ( this.state.isLoadingEmailAccounts || this.state.loadedEmailAccounts ) {
			return;
		}

		this.setState( {
			isLoadingEmailAccounts: true,
		} );

		wp.undocumented()
			.getEmailAccountsForSiteAndDomain( selectedSite.ID, domain.name )
			.then(
				( data ) => {
					this.setState( {
						isLoadingEmailAccounts: false,
						errorLoadingEmailAccounts: false,
						loadedEmailAccounts: true,
						emailAccounts: data?.accounts || [],
					} );
				},
				() => {
					this.setState( {
						isLoadingEmailAccounts: false,
						errorLoadingEmailAccounts: true,
						loadedEmailAccounts: true,
						emailAccounts: [],
					} );
				}
			);
	}

	getEmails() {
		if ( this.state.emailAccounts[ 0 ] ) {
			return this.state.emailAccounts[ 0 ].emails;
		}
		return [];
	}

	handleBack = () => {
		const { selectedSite } = this.props;
		page( emailManagement( selectedSite.slug ) );
	};

	render() {
		const {
			domain,
			selectedSite,
			hasEmailPlanSubscription,
			purchase,
			isLoadingPurchase,
		} = this.props;

		const { statusClass, text, icon } = resolveEmailPlanStatus( domain );

		const cardClasses = classnames( 'email-plan__general', statusClass );

		return (
			<>
				{ domain && <QueryEmailForwards domainName={ domain.name } /> }
				{ selectedSite && hasEmailPlanSubscription && (
					<QuerySitePurchases siteId={ selectedSite.ID } />
				) }
				<HeaderCake onClick={ this.handleBack }>Email plan settings</HeaderCake>
				<CompactCard className={ cardClasses }>
					<span className="email-plan__general-icon">
						<EmailTypeIcon domain={ domain } />
					</span>
					<div>
						<h2>@{ domain.name }</h2>
						<span className="email-plan__status">
							<MaterialIcon icon={ icon } /> { text }
						</span>
					</div>
				</CompactCard>

				{ hasEmailPlanSubscription && (
					<EmailPlanSubscription
						purchase={ purchase }
						domain={ domain }
						selectedSite={ selectedSite }
						isLoadingPurchase={ isLoadingPurchase }
					/>
				) }

				<EmailPlanMailboxesList emails={ this.getEmails() } />

				<VerticalNav>
					<VerticalNavItem path="a">Add new mailbox</VerticalNavItem>
				</VerticalNav>
			</>
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

	let subscriptionId = null;
	let emails = [];

	if ( hasGSuiteWithUs( ownProps.domain ) ) {
		subscriptionId = ownProps.domain?.googleAppsSubscription?.subscriptionId;
		const gsuiteUsersForSite = getGSuiteUsers( state, selectedSiteId ) ?? [];
		const gsuiteUsers = filterEmailListByDomain( gsuiteUsersForSite, ownProps.domain?.name );

		emails = normalizeGsuiteUsers( gsuiteUsers );
	} else if ( hasEmailForwards( ownProps.domain ) ) {
		const emailForwards = getEmailForwards( state, ownProps.domain?.name ) ?? [];
		emails = normalizeEmailForwardingAddresses( emailForwards );
	} else if ( hasTitanMailWithUs( ownProps.domain ) ) {
		subscriptionId = ownProps.domain?.titanMailSubscription?.subscriptionId;
	}

	const purchase = subscriptionId ? getByPurchaseId( state, parseInt( subscriptionId, 10 ) ) : null;

	return {
		isLoadingPurchase:
			isFetchingSitePurchases( state ) || ! hasLoadedSitePurchasesFromServer( state ),
		emails,
		purchase,
		hasEmailPlanSubscription: !! subscriptionId,
	};
} )( localize( EmailPlan ) );
