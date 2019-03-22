/** @format */
/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { find, get, identity } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';

/**
 * Internal dependencies
 */
import { abtest } from 'lib/abtest';
import { themeActivated } from 'state/themes/actions';
import analytics from 'lib/analytics';
import WordPressLogo from 'components/wordpress-logo';
import Card from 'components/card';
import ChargebackDetails from './chargeback-details';
import CheckoutThankYouFeaturesHeader from './features-header';
import CheckoutThankYouHeader from './header';
import DomainMappingDetails from './domain-mapping-details';
import DomainRegistrationDetails from './domain-registration-details';
import { fetchReceipt } from 'state/receipts/actions';
import { fetchSitePlans, refreshSitePlans } from 'state/sites/plans/actions';
import { getPlansBySite, getSitePlanSlug } from 'state/sites/plans/selectors';
import { getReceiptById } from 'state/receipts/selectors';
import {
	getCurrentUser,
	getCurrentUserDate,
	isCurrentUserEmailVerified,
} from 'state/current-user/selectors';
import GoogleAppsDetails from './google-apps-details';
import GuidedTransferDetails from './guided-transfer-details';
import HappinessSupport from 'components/happiness-support';
import HeaderCake from 'components/header-cake';
import PlanThankYouCard from 'blocks/plan-thank-you-card';
import JetpackThankYouCard from './jetpack-thank-you-card';
import AtomicStoreThankYouCard from './atomic-store-thank-you-card';
import {
	isChargeback,
	isDelayedDomainTransfer,
	isDomainMapping,
	isDomainProduct,
	isDomainRedemption,
	isDomainRegistration,
	isDomainTransfer,
	isDotComPlan,
	isEcommerce,
	isGoogleApps,
	isGuidedTransfer,
	isJetpackPlan,
	isPlan,
	isPersonal,
	isPremium,
	isBusiness,
	isSiteRedirect,
	isTheme,
} from 'lib/products-values';
import JetpackPlanDetails from './jetpack-plan-details';
import Main from 'components/main';
import PersonalPlanDetails from './personal-plan-details';
import PremiumPlanDetails from './premium-plan-details';
import BusinessPlanDetails from './business-plan-details';
import EcommercePlanDetails from './ecommerce-plan-details';
import FailedPurchaseDetails from './failed-purchase-details';
import TransferPending from './transfer-pending';
import PurchaseDetail from 'components/purchase-detail';
import {
	getFeatureByKey,
	isJetpackBusinessPlan,
	isWpComBusinessPlan,
	shouldFetchSitePlans,
} from 'lib/plans';
import RebrandCitiesThankYou from './rebrand-cities-thank-you';
import SiteRedirectDetails from './site-redirect-details';
import Notice from 'components/notice';
import {
	domainManagementEmail,
	domainManagementList,
	domainManagementTransferInPrecheck,
} from 'my-sites/domains/paths';
import config from 'config';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isRebrandCitiesSiteUrl } from 'lib/rebrand-cities';
import { fetchAtomicTransfer } from 'state/atomic-transfer/actions';
import { transferStates } from 'state/atomic-transfer/constants';
import getAtomicTransfer from 'state/selectors/get-atomic-transfer';
import isFetchingTransfer from 'state/selectors/is-fetching-atomic-transfer';
import { recordStartTransferClickInThankYou } from 'state/domains/actions';
import PageViewTracker from 'lib/analytics/page-view-tracker';

/**
 * Style dependencies
 */
import './style.scss';

function getPurchases( props ) {
	return [
		...get( props, 'receipt.data.purchases', [] ),
		...get( props, 'gsuiteReceipt.data.purchases', [] ),
	];
}

function getFailedPurchases( props ) {
	return ( props.receipt.data && props.receipt.data.failedPurchases ) || [];
}

function findPurchaseAndDomain( purchases, predicate ) {
	const purchase = find( purchases, predicate );

	return [ purchase, purchase.meta ];
}

export class CheckoutThankYou extends React.Component {
	static propTypes = {
		domainOnlySiteFlow: PropTypes.bool.isRequired,
		failedPurchases: PropTypes.array,
		isFetchingTransfer: PropTypes.bool,
		receiptId: PropTypes.number,
		gsuiteReceiptId: PropTypes.number,
		selectedFeature: PropTypes.string,
		selectedSite: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.object ] ),
		transferComplete: PropTypes.bool,
	};

	static defaultProps = {
		fetchAtomicTransfer: identity,
	};

	componentDidMount() {
		this.redirectIfThemePurchased();
		this.redirectIfDomainOnly( this.props );

		const {
			gsuiteReceipt,
			gsuiteReceiptId,
			receipt,
			receiptId,
			selectedSite,
			sitePlans,
		} = this.props;

		if ( selectedSite && ! this.props.isFetchingTransfer ) {
			this.props.fetchAtomicTransfer( selectedSite );
		}

		if ( selectedSite && receipt.hasLoadedFromServer && this.hasPlanOrDomainProduct() ) {
			this.props.refreshSitePlans( selectedSite );
		} else if ( shouldFetchSitePlans( sitePlans, selectedSite ) ) {
			this.props.fetchSitePlans( selectedSite );
		}

		if ( receiptId && ! receipt.hasLoadedFromServer && ! receipt.isRequesting ) {
			this.props.fetchReceipt( receiptId );
		}

		if (
			gsuiteReceiptId &&
			gsuiteReceipt &&
			! gsuiteReceipt.hasLoadedFromServer &&
			! gsuiteReceipt.isRequesting
		) {
			this.props.fetchReceipt( gsuiteReceiptId );
		}

		analytics.tracks.recordEvent( 'calypso_checkout_thank_you_view' );

		window.scrollTo( 0, 0 );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		this.redirectIfThemePurchased();
		this.redirectIfDomainOnly( nextProps );

		if (
			! this.props.receipt.hasLoadedFromServer &&
			nextProps.receipt.hasLoadedFromServer &&
			this.hasPlanOrDomainProduct( nextProps ) &&
			this.props.selectedSite
		) {
			this.props.refreshSitePlans( this.props.selectedSite );
		}
	}

	hasPlanOrDomainProduct = ( props = this.props ) => {
		return getPurchases( props ).some(
			purchase => isPlan( purchase ) || isDomainProduct( purchase )
		);
	};

	renderConfirmationNotice = () => {
		if ( ! this.props.user || ! this.props.user.email || this.props.user.email_verified ) {
			return null;
		}

		return (
			<Notice
				className="checkout-thank-you__verification-notice"
				showDismiss={ false }
				status="is-warning"
			>
				{ this.props.translate(
					'We’ve sent a message to {{strong}}%(email)s{{/strong}}. ' +
						'Please check your email to confirm your address.',
					{
						args: { email: this.props.user.email },
						components: {
							strong: <strong className="checkout-thank-you__verification-notice-email" />,
						},
					}
				) }
			</Notice>
		);
	};

	renderVerifiedEmailRequired = ( props = this.props ) => {
		const { isEmailVerified } = props;

		if ( isEmailVerified ) {
			return null;
		}

		return (
			<Notice
				className="checkout-thank-you__verified-required"
				showDismiss={ false }
				status="is-error"
			>
				{ this.props.translate(
					'You’re almost there! Take one moment to check your email and ' +
						'verify your address to complete set up of your eCommerce store'
				) }
			</Notice>
		);
	};

	isDataLoaded = () => {
		if ( this.isGenericReceipt() ) {
			return true;
		}

		return (
			( ! this.props.selectedSite || this.props.sitePlans.hasLoadedFromServer ) &&
			this.props.receipt.hasLoadedFromServer &&
			( ! this.props.gsuiteReceipt || this.props.gsuiteReceipt.hasLoadedFromServer )
		);
	};

	isGenericReceipt = () => {
		return ! this.props.receiptId;
	};

	redirectIfThemePurchased = () => {
		const purchases = getPurchases( this.props );

		if (
			this.props.receipt.hasLoadedFromServer &&
			purchases.length > 0 &&
			purchases.every( isTheme )
		) {
			const themeId = purchases[ 0 ].meta;
			this.props.activatedTheme( 'premium/' + themeId, this.props.selectedSite.ID );

			page.redirect( '/themes/' + this.props.selectedSite.slug );
		}
	};

	redirectIfDomainOnly = props => {
		if ( props.domainOnlySiteFlow && get( props, 'receipt.hasLoadedFromServer', false ) ) {
			const purchases = getPurchases( props );
			const failedPurchases = getFailedPurchases( props );
			if ( purchases.length > 0 && ! failedPurchases.length ) {
				const domainName = find( purchases, isDomainRegistration ).meta;
				page( domainManagementList( domainName ) );
			}
		}
	};

	goBack = () => {
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
				purchases.some( isDomainTransfer ) ||
				purchases.some( isDomainRedemption ) ||
				purchases.some( isSiteRedirect )
			) {
				return page( domainManagementList( this.props.selectedSite.slug ) );
			} else if ( purchases.some( isGoogleApps ) ) {
				const purchase = find( purchases, isGoogleApps );

				return page( domainManagementEmail( this.props.selectedSite.slug, purchase.meta ) );
			}
		}

		return page( `/stats/insights/${ this.props.selectedSite.slug }` );
	};

	isEligibleForLiveChat = () => {
		return isJetpackBusinessPlan( this.props.planSlug );
	};

	isNewUser = () => {
		return moment( this.props.userDate ).isAfter( moment().subtract( 2, 'hours' ) );
	};

	getAnalyticsProperties = () => {
		const { gsuiteReceiptId, receiptId, selectedFeature: feature, selectedSite } = this.props;
		const site = get( selectedSite, 'slug' );

		if ( gsuiteReceiptId ) {
			return {
				path: '/checkout/thank-you/:site/:receipt_id/with-gsuite/:gsuite_receipt_id',
				properties: { gsuite_receipt_id: gsuiteReceiptId, receipt_id: receiptId, site },
			};
		}
		if ( feature && receiptId ) {
			return {
				path: '/checkout/thank-you/features/:feature/:site/:receipt_id',
				properties: { feature, receipt_id: receiptId, site },
			};
		}
		if ( feature && ! receiptId ) {
			return {
				path: '/checkout/thank-you/features/:feature/:site',
				properties: { feature, site },
			};
		}
		if ( receiptId && selectedSite ) {
			return {
				path: '/checkout/thank-you/:site/:receipt_id',
				properties: { receipt_id: receiptId, site },
			};
		}
		if ( receiptId && ! selectedSite ) {
			return {
				path: '/checkout/thank-you/no-site/:receipt_id',
				properties: { receipt_id: receiptId },
			};
		}
		if ( selectedSite ) {
			return {
				path: '/checkout/thank-you/:site',
				properties: { site },
			};
		}
		return { path: '/checkout/thank-you/no-site', properties: {} };
	};

	render() {
		const { translate } = this.props;
		let purchases = [];
		let failedPurchases = [];
		let wasJetpackPlanPurchased = false;
		let wasDotcomPlanPurchased = false;
		let wasEcommercePlanPurchased = false;
		let delayedTransferPurchase = false;

		if ( this.isDataLoaded() && ! this.isGenericReceipt() ) {
			purchases = getPurchases( this.props );
			failedPurchases = getFailedPurchases( this.props );
			wasJetpackPlanPurchased = purchases.some( isJetpackPlan );
			wasDotcomPlanPurchased = purchases.some( isDotComPlan );
			wasEcommercePlanPurchased = purchases.some( isEcommerce );
			delayedTransferPurchase = find( purchases, isDelayedDomainTransfer );
		}

		// this placeholder is using just wp logo here because two possible states do not share a common layout
		if (
			! purchases.length &&
			! failedPurchases.length &&
			! this.isGenericReceipt() &&
			! this.props.selectedSite
		) {
			// disabled because we use global loader icon
			/* eslint-disable wpcalypso/jsx-classname-namespace */
			return <WordPressLogo className="wpcom-site__logo" />;
			/* eslint-enable wpcalypso/jsx-classname-namespace */
		}

		// Rebrand Cities thanks page

		if (
			this.props.selectedSite &&
			isRebrandCitiesSiteUrl( this.props.selectedSite.slug ) &&
			isWpComBusinessPlan( this.props.selectedSite.plan.product_slug )
		) {
			return (
				<RebrandCitiesThankYou
					receipt={ this.props.receipt }
					analyticsProperties={ this.getAnalyticsProperties() }
				/>
			);
		}

		if ( wasEcommercePlanPurchased ) {
			if ( ! this.props.transferComplete ) {
				return (
					<TransferPending orderId={ this.props.receiptId } siteId={ this.props.selectedSite.ID } />
				);
			}

			return (
				<Main className="checkout-thank-you">
					<PageViewTracker { ...this.getAnalyticsProperties() } title="Checkout Thank You" />
					{ this.renderConfirmationNotice() }
					{ this.renderVerifiedEmailRequired() }
					<AtomicStoreThankYouCard siteId={ this.props.selectedSite.ID } />
				</Main>
			);
		} else if ( wasDotcomPlanPurchased && ( delayedTransferPurchase || this.isNewUser() ) ) {
			let planProps = {};
			if ( delayedTransferPurchase ) {
				planProps = {
					action: (
						// eslint-disable-next-line
						<a className="thank-you-card__button" onClick={ this.startTransfer }>
							{ translate( 'Start Domain Transfer' ) }
						</a>
					),
					description: translate( "Now let's get your domain transferred." ),
				};
			}

			// streamlined paid NUX thanks page
			return (
				<Main className="checkout-thank-you">
					<PageViewTracker { ...this.getAnalyticsProperties() } title="Checkout Thank You" />
					{ this.renderConfirmationNotice() }
					<PlanThankYouCard siteId={ this.props.selectedSite.ID } { ...planProps } />
				</Main>
			);
		} else if ( wasJetpackPlanPurchased && config.isEnabled( 'plans/jetpack-config-v2' ) ) {
			return (
				<Main className="checkout-thank-you">
					<PageViewTracker { ...this.getAnalyticsProperties() } title="Checkout Thank You" />
					{ this.renderConfirmationNotice() }
					<JetpackThankYouCard siteId={ this.props.selectedSite.ID } />
				</Main>
			);
		}

		if ( this.props.domainOnlySiteFlow && purchases.length > 0 && ! failedPurchases.length ) {
			return null;
		}

		const goBackText = this.props.selectedSite
			? translate( 'Back to my site' )
			: translate( 'Register Domain' );

		// standard thanks page
		return (
			<Main className="checkout-thank-you">
				<PageViewTracker { ...this.getAnalyticsProperties() } title="Checkout Thank You" />
				<HeaderCake onClick={ this.goBack } isCompact backText={ goBackText } />

				<Card className="checkout-thank-you__content">{ this.productRelatedMessages() }</Card>

				<Card className="checkout-thank-you__footer">
					<HappinessSupport
						isJetpack={ wasJetpackPlanPurchased }
						liveChatButtonEventName="calypso_plans_autoconfig_chat_initiated"
						showLiveChatButton={ this.isEligibleForLiveChat() }
					/>
				</Card>
			</Main>
		);
	}

	startTransfer = event => {
		event.preventDefault();

		const { selectedSite } = this.props;
		const purchases = getPurchases( this.props );
		const delayedTransferPurchase = find( purchases, isDelayedDomainTransfer );

		this.props.recordStartTransferClickInThankYou( delayedTransferPurchase.meta );

		page( domainManagementTransferInPrecheck( selectedSite.slug, delayedTransferPurchase.meta ) );
	};

	/**
	 * Retrieves the component (and any corresponding data) that should be displayed according to the type of purchase
	 * just performed by the user.
	 *
	 * @returns {*[]} an array of varying size with the component instance,
	 * then an optional purchase object possibly followed by a domain name
	 */
	getComponentAndPrimaryPurchaseAndDomain = () => {
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
			} else if ( purchases.some( isEcommerce ) ) {
				return [ EcommercePlanDetails, find( purchases, isEcommerce ) ];
			} else if ( purchases.some( isDomainRegistration ) ) {
				return [
					DomainRegistrationDetails,
					...findPurchaseAndDomain( purchases, isDomainRegistration ),
				];
			} else if (
				purchases.some( isGoogleApps ) &&
				abtest( 'gSuitePostCheckoutNotice' ) === 'original'
			) {
				return [ GoogleAppsDetails, ...findPurchaseAndDomain( purchases, isGoogleApps ) ];
			} else if ( purchases.some( isDomainMapping ) ) {
				return [ DomainMappingDetails, ...findPurchaseAndDomain( purchases, isDomainMapping ) ];
			} else if ( purchases.some( isSiteRedirect ) ) {
				return [ SiteRedirectDetails, ...findPurchaseAndDomain( purchases, isSiteRedirect ) ];
			} else if ( purchases.some( isDomainTransfer ) ) {
				return [ false, ...findPurchaseAndDomain( purchases, isDomainTransfer ) ];
			} else if ( purchases.some( isChargeback ) ) {
				return [ ChargebackDetails, find( purchases, isChargeback ) ];
			} else if ( purchases.some( isGuidedTransfer ) ) {
				return [ GuidedTransferDetails, find( purchases, isGuidedTransfer ) ];
			}
		}

		return [];
	};

	productRelatedMessages = () => {
		const { selectedSite, sitePlans } = this.props;
		const purchases = getPurchases( this.props );
		const failedPurchases = getFailedPurchases( this.props );
		const hasFailedPurchases = failedPurchases.length > 0;
		const [
			ComponentClass,
			primaryPurchase,
			domain,
		] = this.getComponentAndPrimaryPurchaseAndDomain();
		const registrarSupportUrl =
			! ComponentClass || this.isGenericReceipt() || hasFailedPurchases
				? null
				: get( primaryPurchase, 'registrarSupportUrl', null );
		const isRootDomainWithUs = get( primaryPurchase, 'isRootDomainWithUs', false );

		if ( ! this.isDataLoaded() ) {
			return (
				<div>
					<CheckoutThankYouHeader isDataLoaded={ false } selectedSite={ selectedSite } />

					<CheckoutThankYouFeaturesHeader isDataLoaded={ false } />

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
				{ purchases.some( isGoogleApps ) && abtest( 'gSuitePostCheckoutNotice' ) === 'enhanced' && (
					<GoogleAppsDetails isRequired />
				) }
				<CheckoutThankYouHeader
					isDataLoaded={ this.isDataLoaded() }
					primaryPurchase={ primaryPurchase }
					selectedSite={ selectedSite }
					hasFailedPurchases={ hasFailedPurchases }
				/>

				{ primaryPurchase && (
					<CheckoutThankYouFeaturesHeader
						isDataLoaded={ this.isDataLoaded() }
						isGenericReceipt={ this.isGenericReceipt() }
						purchases={ purchases }
						hasFailedPurchases={ hasFailedPurchases }
					/>
				) }

				{ ComponentClass && (
					<div className="checkout-thank-you__purchase-details-list">
						<ComponentClass
							domain={ domain }
							purchases={ purchases }
							failedPurchases={ failedPurchases }
							isRootDomainWithUs={ isRootDomainWithUs }
							registrarSupportUrl={ registrarSupportUrl }
							selectedSite={ selectedSite }
							selectedFeature={ getFeatureByKey( this.props.selectedFeature ) }
							sitePlans={ sitePlans }
						/>
					</div>
				) }
			</div>
		);
	};
}

export default connect(
	( state, props ) => {
		const siteId = getSelectedSiteId( state );
		const planSlug = getSitePlanSlug( state, siteId );

		return {
			isFetchingTransfer: isFetchingTransfer( state, siteId ),
			planSlug,
			receipt: getReceiptById( state, props.receiptId ),
			gsuiteReceipt: props.gsuiteReceiptId ? getReceiptById( state, props.gsuiteReceiptId ) : null,
			sitePlans: getPlansBySite( state, props.selectedSite ),
			user: getCurrentUser( state ),
			userDate: getCurrentUserDate( state ),
			transferComplete:
				transferStates.COMPLETED ===
				get( getAtomicTransfer( state, siteId ), 'status', transferStates.PENDING ),
			isEmailVerified: isCurrentUserEmailVerified( state ),
		};
	},
	dispatch => {
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
			recordStartTransferClickInThankYou( domain ) {
				dispatch( recordStartTransferClickInThankYou( domain ) );
			},
			fetchAtomicTransfer( site ) {
				dispatch( fetchAtomicTransfer( site.ID ) );
			},
		};
	}
)( localize( CheckoutThankYou ) );
