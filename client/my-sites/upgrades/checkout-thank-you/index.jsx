/**
 * External dependencies
 */
import { connect } from 'react-redux';
import find from 'lodash/find';
import page from 'page';
import React from 'react';
import moment from 'moment';

/**
 * Internal dependencies
 */
import { themeActivated } from 'state/themes/actions';
import analytics from 'lib/analytics';
import Card from 'components/card';
import ChargebackDetails from './chargeback-details';
import CheckoutThankYouFeaturesHeader from './features-header';
import CheckoutThankYouHeader from './header';
import DomainMappingDetails from './domain-mapping-details';
import DomainRegistrationDetails from './domain-registration-details';
import { fetchReceipt } from 'state/receipts/actions';
import { fetchSitePlans, refreshSitePlans } from 'state/sites/plans/actions';
import { getPlansBySite } from 'state/sites/plans/selectors';
import { getReceiptById } from 'state/receipts/selectors';
import { getCurrentUser, getCurrentUserDate } from 'state/current-user/selectors';
import GoogleAppsDetails from './google-apps-details';
import GuidedTransferDetails from './guided-transfer-details';
import HappinessSupport from 'components/happiness-support';
import HeaderCake from 'components/header-cake';
import PlanThankYouCard from 'blocks/plan-thank-you-card';
import {
	isChargeback,
	isDomainMapping,
	isDomainProduct,
	isDomainRedemption,
	isDomainRegistration,
	isGoogleApps,
	isGuidedTransfer,
	isJetpackPlan,
	isPlan,
	isPersonal,
	isPremium,
	isBusiness,
	isSiteRedirect,
	isTheme
} from 'lib/products-values';
import JetpackPlanDetails from './jetpack-plan-details';
import Main from 'components/main';
import PersonalPlanDetails from './personal-plan-details';
import PremiumPlanDetails from './premium-plan-details';
import BusinessPlanDetails from './business-plan-details';
import PurchaseDetail from 'components/purchase-detail';
import { getFeatureByKey, shouldFetchSitePlans } from 'lib/plans';
import SiteRedirectDetails from './site-redirect-details';
import Notice from 'components/notice';
import upgradesPaths from 'my-sites/upgrades/paths';
import { abtest } from 'lib/abtest';

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
		selectedFeature: React.PropTypes.string,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.bool,
			React.PropTypes.object
		] ).isRequired
	},

	componentDidMount() {
		this.redirectIfThemePurchased();

		if ( this.props.receipt.hasLoadedFromServer && this.hasPlanOrDomainProduct() ) {
			this.props.refreshSitePlans( this.props.selectedSite );
		} else if ( shouldFetchSitePlans( this.props.sitePlans, this.props.selectedSite ) ) {
			this.props.fetchSitePlans( this.props.selectedSite );
		}

		if ( this.props.receiptId && ! this.props.receipt.hasLoadedFromServer && ! this.props.receipt.isRequesting ) {
			this.props.fetchReceipt( this.props.receiptId );
		}

		analytics.tracks.recordEvent( 'calypso_checkout_thank_you_view' );

		window.scrollTo( 0, 0 );
	},

	componentWillReceiveProps( nextProps ) {
		this.redirectIfThemePurchased();

		if (
			! this.props.receipt.hasLoadedFromServer &&
			nextProps.receipt.hasLoadedFromServer &&
			this.hasPlanOrDomainProduct( nextProps )
		) {
			this.props.refreshSitePlans( this.props.selectedSite.ID );
		}
	},

	hasPlanOrDomainProduct( props = this.props ) {
		return getPurchases( props ).some( purchase => isPlan( purchase ) || isDomainProduct( purchase ) );
	},

	renderConfirmationNotice: function() {
		if ( ! this.props.user || ! this.props.user.email || this.props.email_verified ) {
			return null;
		}

		const emailNudgeOnTop = abtest( 'paidNuxThankYouPage' ) === 'emailNudgeOnTop';

		return (
			<Notice
				className="checkout-thank-you__verification-notice"
				showDismiss={ false }
				status={ emailNudgeOnTop ? 'is-warning' : '' }
				>
				{ this.translate( 'We’ve sent a message to {{strong}}%(email)s{{/strong}}. ' +
					'Please check your email to confirm your address.', {
						args: { email: this.props.user.email },
						components: { strong: <strong className="checkout-thank-you__verification-notice-email" />
				} } ) }
			</Notice>
		);
	},

	isDataLoaded() {
		if ( this.isGenericReceipt() ) {
			return true;
		}

		return this.props.sitePlans.hasLoadedFromServer && this.props.receipt.hasLoadedFromServer;
	},

	isGenericReceipt() {
		return ! this.props.receiptId;
	},

	redirectIfThemePurchased() {
		if ( this.props.receipt.hasLoadedFromServer && getPurchases( this.props ).every( isTheme ) ) {
			this.props.activatedTheme( getPurchases( this.props )[ 0 ].meta, this.props.selectedSite.ID );

			page.redirect( '/design/' + this.props.selectedSite.slug );
		}
	},

	goBack() {
		if ( this.isDataLoaded() && ! this.isGenericReceipt() ) {
			const purchases = getPurchases( this.props );
			const site = this.props.selectedSite.slug;

			if ( purchases.some( isPlan ) ) {
				page( `/plans/my-plan/${ site }` );
			} else if (
				purchases.some( isDomainProduct ) ||
				purchases.some( isDomainRedemption || purchases.some( isSiteRedirect ) )
			) {
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
		let purchases = null,
			wasJetpackPlanPurchased = false,
			wasOnlyDotcomPlanPurchased = false;
		if ( this.isDataLoaded() && ! this.isGenericReceipt() ) {
			purchases = getPurchases( this.props );
			wasJetpackPlanPurchased = purchases.some( isJetpackPlan );
			wasOnlyDotcomPlanPurchased = purchases.every( isPlan );
		}

		const userCreatedMoment = moment( this.props.userDate );
		const isNewUser = userCreatedMoment.isAfter( moment().subtract( 2, 'hours' ) );
		const emailNudgeOnTop = abtest( 'paidNuxThankYouPage' ) === 'emailNudgeOnTop';

		// this placeholder is using just wp logo here because two possible states do not share a common layout
		if ( ! purchases && ! this.isGenericReceipt() ) {
			// disabled because we use global loader icon
			/* eslint-disable wpcalypso/jsx-classname-namespace */
			return (
				<div className="wpcom-site__logo noticon noticon-wordpress"></div>
			);
			/* eslint-enable wpcalypso/jsx-classname-namespace */
		}

		// streamlined paid NUX thanks page
		if ( isNewUser && wasOnlyDotcomPlanPurchased ) {
			return (
				<Main className="checkout-thank-you">
					{ emailNudgeOnTop ? this.renderConfirmationNotice() : null }
					<PlanThankYouCard siteId={ this.props.selectedSite.ID } />
					{ ! emailNudgeOnTop ? this.renderConfirmationNotice() : null }
				</Main>
			);
		}

		// standard thanks page
		return (
			<Main className="checkout-thank-you">
				<HeaderCake
					onClick={ this.goBack }
					isCompact
					backText={ this.translate( 'Back to my site' ) } />

				<Card className="checkout-thank-you__content">
					{ this.productRelatedMessages() }
				</Card>

				<Card className="checkout-thank-you__footer">
					<HappinessSupport isJetpack={ wasJetpackPlanPurchased } />
				</Card>
			</Main>
		);
	},

	/**
	 * Retrieves the component (and any corresponding data) that should be displayed according to the type of purchase
	 * just performed by the user.
	 *
	 * @returns {*[]} an array of varying size with the component instance,
	 * then an optional purchase object possibly followed by a domain name
	 */
	getComponentAndPrimaryPurchaseAndDomain() {
		if ( this.isDataLoaded() && ! this.isGenericReceipt() ) {
			const purchases = getPurchases( this.props );

			if ( purchases.some( isJetpackPlan ) ) {
				return [ JetpackPlanDetails, find( purchases, isJetpackPlan ) ];
			} else if ( purchases.some( isPersonal ) ) {
				return [ PersonalPlanDetails, find( purchases, isPersonal ) ];
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
			} else if ( purchases.some( isGuidedTransfer ) ) {
				return [ GuidedTransferDetails, find( purchases, isGuidedTransfer ) ];
			}
		}

		return [];
	},

	productRelatedMessages() {
		const { selectedSite, sitePlans } = this.props,
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
							selectedSite={ selectedSite }
							selectedFeature={ getFeatureByKey( this.props.selectedFeature ) }
							sitePlans={ sitePlans } />
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
			sitePlans: getPlansBySite( state, props.selectedSite ),
			user: getCurrentUser( state ),
			userDate: getCurrentUserDate( state ),
		};
	},
	( dispatch ) => {
		return {
			activatedTheme( meta, site ) {
				dispatch( themeActivated( meta, site, 'calypstore', true ) );
			},
			fetchReceipt( receiptId ) {
				dispatch( fetchReceipt( receiptId ) );
			},
			fetchSitePlans( site ) {
				dispatch( fetchSitePlans( site.ID ) );
			},
			refreshSitePlans( site ) {
				dispatch( refreshSitePlans( site.ID ) );
			},
		};
	}
)( CheckoutThankYou );
