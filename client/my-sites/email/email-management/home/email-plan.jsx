/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { CompactCard } from '@automattic/components';
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
	getGoogleProductSlug,
	getGSuiteSubscriptionId,
	getProductType,
	hasGSuiteWithUs,
} from 'calypso/lib/gsuite';
import { getTitanSubscriptionId, hasTitanMailWithUs } from 'calypso/lib/titan';
import HeaderCake from 'calypso/components/header-cake';
import VerticalNav from 'calypso/components/vertical-nav';
import VerticalNavItem from 'calypso/components/vertical-nav/item';
import EmailTypeIcon from 'calypso/my-sites/email/email-management/home/email-type-icon';
import {
	emailManagement,
	emailManagementAddGSuiteUsers,
	emailManagementForwarding,
	emailManagementManageTitanAccount,
	emailManagementNewTitanAccount,
	emailManagementTitanControlPanelRedirect,
} from 'calypso/my-sites/email/paths';
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
import { getManagePurchaseUrlFor } from 'calypso/my-sites/purchases/paths';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';

class EmailPlan extends React.Component {
	static propTypes = {
		domain: PropTypes.object.isRequired,
		selectedSite: PropTypes.object.isRequired,

		// Connected props
		currentRoute: PropTypes.string,
		hasEmailPlanSubscription: PropTypes.bool,
		isLoadingPurchase: PropTypes.bool,
		purchase: PropTypes.object,
	};

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

	getAddMailboxProps() {
		const { currentRoute, domain, selectedSite } = this.props;

		if ( hasGSuiteWithUs( domain ) ) {
			return {
				path: emailManagementAddGSuiteUsers(
					selectedSite.slug,
					domain.name,
					getProductType( getGoogleProductSlug( domain ) ),
					currentRoute
				),
			};
		}

		if ( hasTitanMailWithUs( domain ) ) {
			const subscriptionId = getTitanSubscriptionId( domain );
			return {
				external: ! subscriptionId,
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
			const googleMailService = getGoogleMailServiceFamily( getGoogleProductSlug( domain ) );
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
		const { hasEmailPlanSubscription, purchase, selectedSite, translate } = this.props;

		if ( ! hasEmailPlanSubscription ) {
			return null;
		}

		if ( ! selectedSite || ! purchase ) {
			return <VerticalNavItem isPlaceHolder />;
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
			hasEmailPlanSubscription,
			purchase,
			isLoadingPurchase,
			translate,
		} = this.props;

		const { statusClass, text, icon } = resolveEmailPlanStatus( domain );

		const cardClasses = classnames( 'email-plan__general', statusClass );
		const addMailboxProps = this.getAddMailboxProps();

		return (
			<>
				{ selectedSite && hasEmailPlanSubscription && (
					<QuerySitePurchases siteId={ selectedSite.ID } />
				) }
				<HeaderCake onClick={ this.handleBack }>{ this.getHeaderText() }</HeaderCake>
				<CompactCard className={ cardClasses }>
					<span className="email-plan__general-icon">
						<EmailTypeIcon domain={ domain } />
					</span>
					<div>
						<h2>{ domain.name }</h2>
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
	let subscriptionId = null;
	if ( hasGSuiteWithUs( ownProps.domain ) ) {
		subscriptionId = getGSuiteSubscriptionId( ownProps.domain );
	} else if ( hasTitanMailWithUs( ownProps.domain ) ) {
		subscriptionId = getTitanSubscriptionId( ownProps.domain );
	}

	const purchase = subscriptionId ? getByPurchaseId( state, parseInt( subscriptionId, 10 ) ) : null;

	return {
		currentRoute: getCurrentRoute( state ),
		isLoadingPurchase:
			isFetchingSitePurchases( state ) || ! hasLoadedSitePurchasesFromServer( state ),
		purchase,
		hasEmailPlanSubscription: !! subscriptionId,
	};
} )( localize( EmailPlan ) );
