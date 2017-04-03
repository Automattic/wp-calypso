/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { find } from 'lodash';
import page from 'page';
import React, { PropTypes } from 'react';
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
import { domainManagementList } from 'my-sites/upgrades/paths';
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
import JetpackThankYouCard from './jetpack-thank-you-card';
import {
	isChargeback,
	isDomainMapping,
	isDomainProduct,
	isDomainRedemption,
	isDomainRegistration,
	isDotComPlan,
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
import FailedPurchaseDetails from './failed-purchase-details';
import PurchaseDetail from 'components/purchase-detail';
import { getFeatureByKey, shouldFetchSitePlans } from 'lib/plans';
import SiteRedirectDetails from './site-redirect-details';
import Notice from 'components/notice';
import ThankYouCard from 'components/thank-you-card';
import upgradesPaths from 'my-sites/upgrades/paths';
import config from 'config';

function getPurchases( props ) {
	return ( props.receipt.data && props.receipt.data.purchases ) || [];
}

function getFailedPurchases( props ) {
	return ( props.receipt.data && props.receipt.data.failedPurchases ) || [];
}

function findPurchaseAndDomain( purchases, predicate ) {
	const purchase = find( purchases, predicate );

	return [ purchase, purchase.meta ];
}

const CheckoutThankYou = React.createClass( {
	propTypes: {
		domainOnlySiteFlow: PropTypes.bool.isRequired,
		failedPurchases: PropTypes.array,
		productsList: PropTypes.object.isRequired,
		receiptId: PropTypes.number,
		selectedFeature: PropTypes.string,
		selectedSite: PropTypes.oneOfType( [
			PropTypes.bool,
			PropTypes.object
		] ).isRequired
	},

	componentDidMount() {
		this.redirectIfThemePurchased();

		const {
			receipt,
			receiptId,
			selectedSite,
			sitePlans
		} = this.props;

		if ( selectedSite && receipt.hasLoadedFromServer && this.hasPlanOrDomainProduct() ) {
			this.props.refreshSitePlans( selectedSite );
		} else if ( shouldFetchSitePlans( sitePlans, selectedSite ) ) {
			this.props.fetchSitePlans( selectedSite );
		}

		if ( receiptId && ! receipt.hasLoadedFromServer && ! receipt.isRequesting ) {
			this.props.fetchReceipt( receiptId );
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
			this.props.refreshSitePlans( this.props.selectedSite );
		}
	},

	hasPlanOrDomainProduct( props = this.props ) {
		return getPurchases( props ).some( purchase => isPlan( purchase ) || isDomainProduct( purchase ) );
	},

	renderConfirmationNotice: function() {
		if ( ! this.props.user || ! this.props.user.email || this.props.user.email_verified ) {
			return null;
		}

		return (
			<Notice
				className="checkout-thank-you__verification-notice"
				showDismiss={ false }
				status="is-warning"
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

		return ( ! this.props.selectedSite || this.props.sitePlans.hasLoadedFromServer ) && this.props.receipt.hasLoadedFromServer;
	},

	isGenericReceipt() {
		return ! this.props.receiptId;
	},

	redirectIfThemePurchased() {
		const purchases = getPurchases( this.props );

		if ( this.props.receipt.hasLoadedFromServer && purchases.length > 0 && purchases.every( isTheme ) ) {
			const themeId = purchases[ 0 ].meta;
			this.props.activatedTheme( 'premium/' + themeId, this.props.selectedSite.ID );

			page.redirect( '/themes/' + this.props.selectedSite.slug );
		}
	},

	goBack() {
		if ( this.isDataLoaded() && ! this.isGenericReceipt() ) {
			const purchases = getPurchases( this.props );
			const site = this.props.selectedSite.slug;

			if ( ! site && getFailedPurchases( this.props ).length > 0 ) {
				return page( '/start/domain-first' );
			}

			if ( purchases.some( isPlan ) ) {
				return page( `/plans/my-plan/${ site }` );
			} else if (
				purchases.some( isDomainProduct ) ||
				purchases.some( isDomainRedemption || purchases.some( isSiteRedirect ) )
			) {
				return page( upgradesPaths.domainManagementList( this.props.selectedSite.slug ) );
			} else if ( purchases.some( isGoogleApps ) ) {
				const purchase = find( purchases, isGoogleApps );

				return page( upgradesPaths.domainManagementEmail( this.props.selectedSite.slug, purchase.meta ) );
			}
		}

		return page( `/stats/insights/${ this.props.selectedSite.slug }` );
	},

	render() {
		let purchases = [],
			failedPurchases = [],
			wasJetpackPlanPurchased = false,
			wasDotcomPlanPurchased = false;

		if ( this.isDataLoaded() && ! this.isGenericReceipt() ) {
			purchases = getPurchases( this.props );
			failedPurchases = getFailedPurchases( this.props );
			wasJetpackPlanPurchased = purchases.some( isJetpackPlan );
			wasDotcomPlanPurchased = purchases.some( isDotComPlan );
		}

		// this placeholder is using just wp logo here because two possible states do not share a common layout
		if ( ! purchases.length && ! failedPurchases.length && ! this.isGenericReceipt() ) {
			// disabled because we use global loader icon
			/* eslint-disable wpcalypso/jsx-classname-namespace */
			return (
				<div className="wpcom-site__logo noticon noticon-wordpress"></div>
			);
			/* eslint-enable wpcalypso/jsx-classname-namespace */
		}

		const userCreatedMoment = moment( this.props.userDate ),
			isNewUser = userCreatedMoment.isAfter( moment().subtract( 2, 'hours' ) );

		// streamlined paid NUX thanks page
		if ( isNewUser && wasDotcomPlanPurchased ) {
			return (
				<Main className="checkout-thank-you">
					{ this.renderConfirmationNotice() }
					<PlanThankYouCard siteId={ this.props.selectedSite.ID } />
				</Main>
			);
		} else if ( wasJetpackPlanPurchased && config.isEnabled( 'plans/jetpack-config-v2' ) ) {
			return (
				<Main className="checkout-thank-you">
					{ this.renderConfirmationNotice() }
					<JetpackThankYouCard siteId={ this.props.selectedSite.ID } />
				</Main>
			);
		}

		if ( this.props.domainOnlySiteFlow && purchases.length > 0 && ! failedPurchases.length ) {
			const domainName = find( purchases, isDomainRegistration ).meta;

			return (
				<Main className="checkout-thank-you">
					{ this.renderConfirmationNotice() }

					<ThankYouCard
						name={ domainName }
						price={ this.props.receipt.data.displayPrice }
						heading={ this.translate( 'Thank you for your purchase!' ) }
						description={ this.translate( "That looks like a great domain. Now it's time to get it all set up." ) }
						buttonUrl={ domainManagementList( domainName ) }
						buttonText={ this.translate( 'Go To Your Domain' ) }
					/>
				</Main>
			);
		}

		const goBackText = this.props.selectedSite ? this.translate( 'Back to my site' ) : this.translate( 'Register Domain' );

		// standard thanks page
		return (
			<Main className="checkout-thank-you">
				<HeaderCake
					onClick={ this.goBack }
					isCompact
					backText={ goBackText } />

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
			const purchases = getPurchases( this.props ),
				failedPurchases = getFailedPurchases( this.props );

			if ( failedPurchases.length > 0 ) {
				return [ FailedPurchaseDetails ];
			} else if ( purchases.some( isJetpackPlan ) ) {
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
			purchases = getPurchases( this.props ),
			failedPurchases = getFailedPurchases( this.props ),
			hasFailedPurchases = failedPurchases.length > 0,
			[ ComponentClass, primaryPurchase, domain ] = this.getComponentAndPrimaryPurchaseAndDomain(),
			registrarSupportUrl = ( ! ComponentClass || this.isGenericReceipt() || hasFailedPurchases )
				? null
				: primaryPurchase.registrarSupportUrl;

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

		return (
			<div>
				<CheckoutThankYouHeader
					isDataLoaded={ this.isDataLoaded() }
					primaryPurchase={ primaryPurchase }
					selectedSite={ selectedSite }
					hasFailedPurchases={ hasFailedPurchases }
				/>

				<CheckoutThankYouFeaturesHeader
					isDataLoaded={ this.isDataLoaded() }
					isGenericReceipt={ this.isGenericReceipt() }
					purchases={ purchases }
					hasFailedPurchases={ hasFailedPurchases }
				/>

				{ ComponentClass && (
					<div className="checkout-thank-you__purchase-details-list">
						<ComponentClass
							domain={ domain }
							purchases={ purchases }
							failedPurchases={ failedPurchases }
							registrarSupportUrl={ registrarSupportUrl }
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
