/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { isEnabled } from '@automattic/calypso-config';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import wp from 'calypso/lib/wp';
import {
	getGoogleAdminUrl,
	getGoogleMailServiceFamily,
	getGSuiteProductSlug,
	getProductType,
	hasGSuiteWithUs,
} from 'calypso/lib/gsuite';
import {
	getEmailPurchaseByDomain,
	hasEmailSubscription,
} from 'calypso/my-sites/email/email-management/home/utils';
import { getTitanSubscriptionId, hasTitanMailWithUs } from 'calypso/lib/titan';
import HeaderCake from 'calypso/components/header-cake';
import VerticalNav from 'calypso/components/vertical-nav';
import VerticalNavItem from 'calypso/components/vertical-nav/item';
import {
	emailManagement,
	emailManagementAddGSuiteUsers,
	emailManagementForwarding,
	emailManagementManageTitanAccount,
	emailManagementNewTitanAccount,
	emailManagementTitanControlPanelRedirect,
} from 'calypso/my-sites/email/paths';
import EmailPlanHeader from 'calypso/my-sites/email/email-management/home/email-plan-header';
import EmailPlanMailboxesList from 'calypso/my-sites/email/email-management/home/email-plan-mailboxes-list';
import {
	hasLoadedSitePurchasesFromServer,
	isFetchingSitePurchases,
} from 'calypso/state/purchases/selectors';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import { getManagePurchaseUrlFor } from 'calypso/my-sites/purchases/paths';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';

class EmailPlan extends React.Component {
	static propTypes = {
		domain: PropTypes.object.isRequired,
		selectedSite: PropTypes.object.isRequired,

		// Connected props
		currentRoute: PropTypes.string,
		hasSubscription: PropTypes.bool,
		isLoadingPurchase: PropTypes.bool,
		purchase: PropTypes.object,
	};

	state = {
		isLoadingEmailAccounts: false,
		hasLoadedEmailAccounts: false,
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

		if ( this.state.isLoadingEmailAccounts || this.state.hasLoadedEmailAccounts ) {
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
						hasLoadedEmailAccounts: true,
						emailAccounts: data?.accounts || [],
					} );
				},
				() => {
					this.setState( {
						isLoadingEmailAccounts: false,
						hasLoadedEmailAccounts: true,
						emailAccounts: [],
					} );
				}
			);
	}

	getAccountType() {
		return this.state?.emailAccounts[ 0 ]?.account_type ?? null;
	}

	getMailboxes() {
		if ( this.state.emailAccounts[ 0 ] ) {
			return this.state.emailAccounts[ 0 ].emails;
		}
		return [];
	}

	handleBack = () => {
		const { selectedSite } = this.props;
		page( emailManagement( selectedSite.slug ) );
	};

	getAddMailboxProps() {
		const { currentRoute, domain, selectedSite } = this.props;

		if ( hasGSuiteWithUs( domain ) ) {
			return {
				path: emailManagementAddGSuiteUsers(
					selectedSite.slug,
					domain.name,
					getProductType( getGSuiteProductSlug( domain ) ),
					currentRoute
				),
			};
		}

		if ( hasTitanMailWithUs( domain ) ) {
			const hasSubscriptionId = !! getTitanSubscriptionId( domain );
			return {
				external: ! hasSubscriptionId,
				path: emailManagementNewTitanAccount( selectedSite.slug, domain.name, currentRoute ),
			};
		}

		return {
			path: emailManagementForwarding( selectedSite.slug, domain.name, currentRoute ),
		};
	}

	getHeaderText() {
		const { domain, translate } = this.props;

		if ( hasGSuiteWithUs( domain ) ) {
			const googleMailService = getGoogleMailServiceFamily( getGSuiteProductSlug( domain ) );
			return translate( '%(googleMailService)s settings', {
				args: {
					googleMailService,
				},
				comment: '%(googleMailService)s can be either "GSuite" or "Google Workspace"',
			} );
		}

		if ( hasTitanMailWithUs( domain ) ) {
			return translate( 'Email settings' );
		}

		return translate( 'Email forwarding settings' );
	}

	renderBillingNavItem() {
		const { hasSubscription, purchase, selectedSite, translate } = this.props;

		if ( ! hasSubscription ) {
			return null;
		}

		if ( ! selectedSite || ! purchase ) {
			return <VerticalNavItem isPlaceholder />;
		}

		const managePurchaseUrl = getManagePurchaseUrlFor( selectedSite.slug, purchase.id );
		return (
			<VerticalNavItem path={ managePurchaseUrl }>
				{ translate( 'Billing and payment settings' ) }
			</VerticalNavItem>
		);
	}

	getManageAllNavItemProps() {
		const { currentRoute, domain, selectedSite } = this.props;

		if ( hasGSuiteWithUs( domain ) ) {
			return {
				external: true,
				path: getGoogleAdminUrl( domain.name ),
			};
		}

		if ( hasTitanMailWithUs( domain ) ) {
			if ( isEnabled( 'titan/iframe-control-panel' ) ) {
				return {
					path: emailManagementManageTitanAccount( selectedSite.slug, domain.name, currentRoute ),
				};
			}

			return {
				external: true,
				path: emailManagementTitanControlPanelRedirect(
					selectedSite.slug,
					domain.name,
					currentRoute
				),
			};
		}

		return {
			path: emailManagementForwarding( selectedSite.slug, domain.name, currentRoute ),
		};
	}

	renderManageAllNavItem() {
		const { domain, translate } = this.props;

		if ( ! domain ) {
			return null;
		}

		if ( ! hasGSuiteWithUs( domain ) && ! hasTitanMailWithUs( domain ) ) {
			return null;
		}

		const manageAllNavItemProps = this.getManageAllNavItemProps();

		return (
			<VerticalNavItem { ...manageAllNavItemProps }>
				{ translate( 'Manage all mailboxes', {
					comment:
						'This is the text for a link to manage all email accounts/mailboxes for a subscription',
				} ) }
			</VerticalNavItem>
		);
	}

	render() {
		const {
			domain,
			selectedSite,
			hasSubscription,
			purchase,
			isLoadingPurchase,
			translate,
		} = this.props;

		const addMailboxProps = this.getAddMailboxProps();
		const { isLoadingEmailAccounts } = this.state;

		return (
			<>
				{ selectedSite && hasSubscription && <QuerySitePurchases siteId={ selectedSite.ID } /> }

				<HeaderCake onClick={ this.handleBack }>{ this.getHeaderText() }</HeaderCake>

				<EmailPlanHeader
					domain={ domain }
					hasEmailSubscription={ hasSubscription }
					isLoadingPurchase={ isLoadingPurchase }
					purchase={ purchase }
					selectedSite={ selectedSite }
				/>

				<EmailPlanMailboxesList
					accountType={ this.getAccountType() }
					mailboxes={ this.getMailboxes() }
					isLoadingEmails={ isLoadingEmailAccounts }
				/>

				<div className="email-plan__actions">
					<VerticalNav>
						<VerticalNavItem { ...addMailboxProps }>
							{ translate( 'Add new mailbox' ) }
						</VerticalNavItem>
						{ this.renderManageAllNavItem() }
						{ this.renderBillingNavItem() }
					</VerticalNav>
				</div>
			</>
		);
	}
}

export default connect( ( state, ownProps ) => {
	return {
		currentRoute: getCurrentRoute( state ),
		isLoadingPurchase:
			isFetchingSitePurchases( state ) || ! hasLoadedSitePurchasesFromServer( state ),
		purchase: getEmailPurchaseByDomain( state, ownProps.domain ),
		hasSubscription: hasEmailSubscription( ownProps.domain ),
	};
} )( localize( EmailPlan ) );
