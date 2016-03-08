/**
 * External dependencies
 */
import classNames from 'classnames';
import { connect } from 'react-redux';
import find from 'lodash/find';
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import { activated } from 'state/themes/actions';
import analytics from 'analytics';
import BusinessPlanDetails from './business-plan-details';
import Card from 'components/card';
import ChargebackDetails from './chargeback-details';
import CheckoutThankYouFeaturesHeader from './features-header';
import CheckoutThankYouHeader from './header';
import Dispatcher from 'dispatcher';
import DomainMappingDetails from './domain-mapping-details';
import DomainRegistrationDetails from './domain-registration-details';
import { fetchReceipt } from 'state/receipts/actions';
import FreeTrialNudge from './free-trial-nudge'
import { getPlansBySite } from 'state/sites/plans/selectors';
import { getReceiptById } from 'state/receipts/selectors';
import GoogleAppsDetails from './google-apps-details';
import HappinessSupport from 'components/happiness-support';
import HeaderCake from 'components/header-cake';
import {
	isBusiness,
	isChargeback,
	isDomainMapping,
	isDomainProduct,
	isDomainRedemption,
	isDomainRegistration,
	isGoogleApps,
	isJetpackPlan,
	isPlan,
	isPremium,
	isSiteRedirect,
	isTheme
} from 'lib/products-values';
import JetpackPlanDetails from './jetpack-plan-details';
import Main from 'components/main';
import plansPaths from 'my-sites/plans/paths';
import PremiumPlanDetails from './premium-plan-details';
import PurchaseDetail from 'components/purchase-detail';
import {
	fetchSitePlans,
	refreshSitePlans
} from 'state/sites/plans/actions';
import { shouldFetchSitePlans } from 'lib/plans';
import SiteRedirectDetails from './site-redirect-details';
import upgradesPaths from 'my-sites/upgrades/paths';

function getPurchases( props ) {
	return props.receipt.data.purchases;
}

function findPurchaseAndDomain( purchases, predicate ) {
	const purchase = find( purchases, predicate );

	return [ purchase, purchase.meta ];
}

const CheckoutThankYou = React.createClass( {
	propTypes: {
		productsList: React.PropTypes.object.isRequired,
		receiptId: React.PropTypes.number,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.bool,
			React.PropTypes.object
		] ).isRequired
	},

	componentDidMount() {
		this.redirectIfThemePurchased();
		this.refreshSitesAndSitePlansIfPlanPurchased();

		if ( this.props.receiptId && ! this.props.receipt.hasLoadedFromServer && ! this.props.receipt.isRequesting ) {
			this.props.fetchReceipt( this.props.receiptId );
		}

		analytics.tracks.recordEvent( 'calypso_checkout_thank_you_view' );

		window.scrollTo( 0, 0 );
	},

	componentWillReceiveProps() {
		this.redirectIfThemePurchased();
		this.refreshSitesAndSitePlansIfPlanPurchased();

		// Fetches site plans only if they weren't refreshed or if they have not been loaded yet
		this.props.fetchSitePlans( this.props.sitePlans, this.props.selectedSite );
	},

	refreshSitesAndSitePlansIfPlanPurchased() {
		if ( this.props.receipt.hasLoadedFromServer && getPurchases( this.props ).some( isPlan ) ) {
			// Refresh selected site plans if the user just purchased a plan
			this.props.refreshSitePlans( this.props.selectedSite.ID );

			// Refresh the list of sites to update the `site.plan` property
			// needed to display the plan name on the right of the `Plans` menu item
			Dispatcher.handleViewAction( {
				type: 'FETCH_SITES'
			} );
		}
	},

	isDataLoaded() {
		return this.isGenericReceipt() || this.props.receipt.hasLoadedFromServer;
	},

	isGenericReceipt() {
		return ! this.props.receiptId;
	},

	redirectIfThemePurchased() {
		if ( this.props.receipt.hasLoadedFromServer && getPurchases( this.props ).every( isTheme ) ) {
			this.props.activatedTheme( getPurchases( this.props )[ 0 ].meta, this.props.selectedSite );

			page.redirect( '/design/' + this.props.selectedSite.slug );
		}
	},

	goBack() {
		if ( this.isDataLoaded() && ! this.isGenericReceipt() ) {
			const purchases = getPurchases( this.props );

			if ( purchases.some( isPlan ) ) {
				page( plansPaths.plans( this.props.selectedSite.slug ) );
			} else if ( purchases.some( isDomainProduct ) || purchases.some( isDomainRedemption || purchases.some( isSiteRedirect ) ) ) {
				page( upgradesPaths.domainManagementList( this.props.selectedSite.slug ) );
			} else if ( purchases.some( isGoogleApps ) ) {
				const purchase = find( purchases, isGoogleApps );

				page( upgradesPaths.domainManagementEmail( this.props.selectedSite.slug, purchase.meta ) );
			}
		} else {
			page( `/stats/insights/${ this.props.selectedSite.slug }` );
		}
	},

	render() {
		const classes = classNames( 'checkout-thank-you', {
			'is-placeholder': ! this.isDataLoaded()
		} );

		let purchases = null;

		if ( this.isDataLoaded() && ! this.isGenericReceipt() ) {
			purchases = getPurchases( this.props );
		}

		return (
			<Main className={ classes }>
				<HeaderCake onClick={ this.goBack } isCompact backText={ this.translate( 'Back to my site' ) } />

				<Card className="checkout-thank-you__content">
					{ this.productRelatedMessages() }
				</Card>

				<Card className="checkout-thank-you__footer">
					<HappinessSupport isJetpack={ purchases && purchases.some( isJetpackPlan ) } />
				</Card>
			</Main>
		);
	},

	/**
	 * Retrieves the component (and any corresponding data) that should be displayed according to the type of purchase
	 * just performed by the user.
	 *
	 * @returns {*[]} an array of varying size with the component instance, then an optional purchase object possibly followed by a domain name
	 */
	getComponentAndPrimaryPurchaseAndDomain() {
		if ( this.isDataLoaded() && ! this.isGenericReceipt() ) {
			const purchases = getPurchases( this.props );

			if ( purchases.some( isJetpackPlan ) ) {
				return [ JetpackPlanDetails, find( purchases, isJetpackPlan ) ];
			} else if ( purchases.some( isPremium ) ) {
				return [ PremiumPlanDetails, find( purchases, isPremium ) ];
			} else if ( purchases.some( isBusiness ) ) {
				return [ BusinessPlanDetails, find( purchases, isBusiness ) ];
			} else if ( purchases.some( isDomainRegistration ) ) {
				return [ DomainRegistrationDetails, ...findPurchaseAndDomain( purchases, isDomainRegistration ) ];
			} else if ( purchases.some( isGoogleApps ) ) {
				return [ GoogleAppsDetails, ...findPurchaseAndDomain( purchases, isGoogleApps ) ];
			} else if ( purchases.some( isDomainMapping ) ) {
				return [ DomainMappingDetails, ...findPurchaseAndDomain( purchases, isDomainMapping ) ];
			} else if ( purchases.some( isSiteRedirect ) ) {
				return [ SiteRedirectDetails, ...findPurchaseAndDomain( purchases, isSiteRedirect ) ];
			} else if ( purchases.some( isChargeback ) ) {
				return [ ChargebackDetails, find( purchases, isChargeback ) ];
			}
		}

		return [];
	},

	productRelatedMessages() {
		const selectedSite = this.props.selectedSite,
			[ ComponentClass, primaryPurchase, domain ] = this.getComponentAndPrimaryPurchaseAndDomain();

		if ( ! this.isDataLoaded() ) {
			return (
				<div>
					<CheckoutThankYouHeader
						isDataLoaded={ false }
						selectedSite={ selectedSite } />

					<CheckoutThankYouFeaturesHeader
						isDataLoaded={ false } />

					<div className="checkout-thank-you__purchase-details-list">
						<PurchaseDetail isPlaceholder />
						<PurchaseDetail isPlaceholder />
						<PurchaseDetail isPlaceholder />
					</div>
				</div>
			);
		}

		let purchases;

		if ( ! this.isGenericReceipt() ) {
			purchases = getPurchases( this.props );
		}

		return (
			<div>
				<CheckoutThankYouHeader
					isDataLoaded={ this.isDataLoaded() }
					primaryPurchase={ primaryPurchase }
					selectedSite={ selectedSite } />

				<CheckoutThankYouFeaturesHeader
					isDataLoaded={ this.isDataLoaded() }
					isGenericReceipt={ this.isGenericReceipt() }
					purchases={ purchases } />

				{ ComponentClass && (
					<div className="checkout-thank-you__purchase-details-list">
						<ComponentClass
							domain={ domain }
							purchases={ purchases }
							registrarSupportUrl={ this.isGenericReceipt() ? null : primaryPurchase.registrarSupportUrl }
							selectedSite={ selectedSite } />

						<FreeTrialNudge
							purchases={ purchases }
							selectedSite={ selectedSite }
							sitePlans={ this.props.sitePlans } />
					</div>
				) }
			</div>
		);
	}
} );

export default connect(
	( state, props ) => {
		return {
			receipt: getReceiptById( state, props.receiptId ),
			sitePlans: getPlansBySite( state, props.selectedSite )
		};
	},
	( dispatch ) => {
		return {
			activatedTheme: ( meta, site ) => {
				dispatch( activated( meta, site, 'calypstore', true ) );
			},
			fetchReceipt: ( receiptId ) => {
				dispatch( fetchReceipt( receiptId ) );
			},
			fetchSitePlans( sitePlans, site ) {
				if ( shouldFetchSitePlans( sitePlans, site ) ) {
					dispatch( fetchSitePlans( site.ID ) );
				}
			},
			refreshSitePlans: ( siteId ) => {
				dispatch( refreshSitePlans( siteId ) );
			}
		};
	}
)( CheckoutThankYou );
