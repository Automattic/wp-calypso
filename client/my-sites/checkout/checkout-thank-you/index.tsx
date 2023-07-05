import {
	isBlogger,
	isBusiness,
	isChargeback,
	isCredits,
	isDelayedDomainTransfer,
	isDIFMProduct,
	isDomainMapping,
	isDomainProduct,
	isDomainRedemption,
	isDomainRegistration,
	isDomainTransfer,
	isEcommerce,
	isGSuiteOrExtraLicenseOrGoogleWorkspace,
	isGSuiteOrGoogleWorkspace,
	isJetpackPlan,
	isPersonal,
	isPlan,
	isPremium,
	isPro,
	isSiteRedirect,
	isStarter,
	isThemePurchase,
	isTitanMail,
	shouldFetchSitePlans,
} from '@automattic/calypso-products';
import { Card } from '@automattic/components';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import page from 'page';
import { Component } from 'react';
import { connect } from 'react-redux';
import PlanThankYouCard from 'calypso/blocks/plan-thank-you-card';
import HappinessSupport from 'calypso/components/happiness-support';
import Main from 'calypso/components/main';
import Notice from 'calypso/components/notice';
import PurchaseDetail from 'calypso/components/purchase-detail';
import WordPressLogo from 'calypso/components/wordpress-logo';
import WpAdminAutoLogin from 'calypso/components/wpadmin-auto-login';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getFeatureByKey } from 'calypso/lib/plans/features-list';
import { isExternal } from 'calypso/lib/url';
import DIFMLiteThankYou from 'calypso/my-sites/checkout/checkout-thank-you/difm/difm-lite-thank-you';
import {
	domainManagementList,
	domainManagementTransferInPrecheck,
} from 'calypso/my-sites/domains/paths';
import { emailManagement } from 'calypso/my-sites/email/paths';
import TitanSetUpThankYou from 'calypso/my-sites/email/titan-set-up-thank-you';
import { isStarterPlanEnabled } from 'calypso/my-sites/plans-comparison';
import { fetchAtomicTransfer } from 'calypso/state/atomic-transfer/actions';
import { transferStates } from 'calypso/state/atomic-transfer/constants';
import {
	getCurrentUser,
	getCurrentUserDate,
	isCurrentUserEmailVerified,
} from 'calypso/state/current-user/selectors';
import { recordStartTransferClickInThankYou } from 'calypso/state/domains/actions';
import { fetchSitePlugins } from 'calypso/state/plugins/installed/actions';
import {
	getPlugins as getInstalledPlugins,
	isRequesting as isRequestingSitePlugins,
} from 'calypso/state/plugins/installed/selectors';
import { isProductsListFetching } from 'calypso/state/products-list/selectors';
import { fetchReceipt } from 'calypso/state/receipts/actions';
import { getReceiptById } from 'calypso/state/receipts/selectors';
import getAtomicTransfer from 'calypso/state/selectors/get-atomic-transfer';
import getCheckoutUpgradeIntent from 'calypso/state/selectors/get-checkout-upgrade-intent';
import getCustomizeOrEditFrontPageUrl from 'calypso/state/selectors/get-customize-or-edit-front-page-url';
import { fetchSitePlans, refreshSitePlans } from 'calypso/state/sites/plans/actions';
import { getPlansBySite } from 'calypso/state/sites/plans/selectors';
import { getSiteHomeUrl, getSiteSlug, getSite } from 'calypso/state/sites/selectors';
import { requestThenActivate } from 'calypso/state/themes/actions';
import { getActiveTheme } from 'calypso/state/themes/selectors';
import { IAppState } from 'calypso/state/types';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import AtomicStoreThankYouCard from './atomic-store-thank-you-card';
import BloggerPlanDetails from './blogger-plan-details';
import BusinessPlanDetails from './business-plan-details';
import ChargebackDetails from './chargeback-details';
import DomainMappingDetails from './domain-mapping-details';
import DomainRegistrationDetails from './domain-registration-details';
import DomainThankYou from './domains/domain-thank-you';
import EcommercePlanDetails from './ecommerce-plan-details';
import FailedPurchaseDetails from './failed-purchase-details';
import CheckoutThankYouFeaturesHeader from './features-header';
import GoogleAppsDetails from './google-apps-details';
import CheckoutThankYouHeader from './header';
import JetpackPlanDetails from './jetpack-plan-details';
import PersonalPlanDetails from './personal-plan-details';
import PremiumPlanDetails from './premium-plan-details';
import ProPlanDetails from './pro-plan-details';
import MasterbarStyled from './redesign-v2/masterbar-styled';
import Footer from './redesign-v2/sections/Footer';
import SiteRedirectDetails from './site-redirect-details';
import StarterPlanDetails from './starter-plan-details';
import TransferPending from './transfer-pending';
import './style.scss';
import type { SitesPlansResult } from '../composite-checkout/hooks/product-variants';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from '@automattic/calypso-products';
import type { SiteDetails } from '@automattic/data-stores';
import type { UserData } from 'calypso/lib/user/user';
import type { DomainThankYouType } from 'calypso/my-sites/checkout/checkout-thank-you/domains/types';
import type { ReceiptState, ReceiptPurchase } from 'calypso/state/receipts/types';
import type { LocalizeProps } from 'i18n-calypso';

type ComponentAndPrimaryPurchaseAndDomain =
	| []
	| [ string | false ]
	| [ string | false, ReceiptPurchase | undefined ]
	| [ string | false, ReceiptPurchase | undefined, string | undefined ];

export interface CheckoutThankYouProps {
	domainOnlySiteFlow: boolean;
	email: string;
	receiptId: number;
	gsuiteReceiptId: number;
	selectedFeature: string;
	selectedSite: null | SiteDetails;
	siteUnlaunchedBeforeUpgrade: boolean;
	upgradeIntent: string;
	redirectTo?: string;
	displayMode?: string;
}

export interface CheckoutThankYouConnectedProps {
	isProductsListFetching: boolean;
	receipt: ReceiptState;
	gsuiteReceipt: ReceiptState | null;
	sitePlans: SitesPlansResult;
	isWooCommerceInstalled: boolean;
	isFetchingSitePlugins: boolean;
	upgradeIntent: string;
	isSimplified: boolean;
	user: UserData | null | undefined;
	userDate: string | undefined;
	transferComplete: boolean;
	isEmailVerified: boolean;
	selectedSiteSlug: string | null;
	siteHomeUrl: string;
	customizeUrl: string | null | undefined;
	site: SiteDetails | null | undefined;
	fetchAtomicTransfer: ( siteId: number ) => void;
	fetchSitePlugins: ( siteId: number ) => void;
	fetchReceipt: ( receiptId: number ) => void;
	fetchSitePlans: ( siteId: number ) => void;
	refreshSitePlans: ( siteId: number ) => void;
	recordStartTransferClickInThankYou: ( domainName: string ) => void;
	requestThenActivate: (
		themeId: string,
		siteId: number,
		source?: string,
		purchased?: boolean,
		keepCurrentHomepage?: boolean
	) => void;
}

interface CheckoutThankYouState {
	didThemeRedirect: boolean;
}

export type CheckoutThankYouCombinedProps = CheckoutThankYouProps &
	CheckoutThankYouConnectedProps &
	LocalizeProps;

type FindPredicate = (
	product: ( WithSnakeCaseSlug | WithCamelCaseSlug ) & {
		is_domain_registration?: boolean;
		isDomainRegistration?: boolean;
		meta: string;
	}
) => boolean;

function getPurchases( props: CheckoutThankYouCombinedProps ): ReceiptPurchase[] {
	return [
		...( props?.receipt?.data?.purchases ?? [] ),
		...( props?.gsuiteReceipt?.data?.purchases ?? [] ),
	];
}

function getFailedPurchases( props: CheckoutThankYouCombinedProps ) {
	return ( props.receipt.data && props.receipt.data.failedPurchases ) || [];
}

function findPurchaseAndDomain(
	purchases: ReceiptPurchase[],
	predicate: FindPredicate
): [ ReceiptPurchase | undefined, string | undefined ] {
	const purchase = purchases.find( ( purchase ) => predicate( purchase ) );

	return [ purchase, purchase?.meta ];
}

export class CheckoutThankYou extends Component<
	CheckoutThankYouCombinedProps,
	CheckoutThankYouState
> {
	static propTypes = {};

	constructor( props: CheckoutThankYouCombinedProps ) {
		super( props );
		this.state = {
			didThemeRedirect: false,
		};
	}

	componentDidMount() {
		this.redirectIfThemePurchased();

		const { gsuiteReceipt, gsuiteReceiptId, receipt, receiptId, selectedSite, sitePlans } =
			this.props;

		if ( selectedSite ) {
			this.props.fetchAtomicTransfer?.( selectedSite.ID );
		}

		if ( selectedSite && receipt.hasLoadedFromServer && this.hasPlanOrDomainProduct() ) {
			this.props.refreshSitePlans( selectedSite.ID );
		} else if ( selectedSite && shouldFetchSitePlans( sitePlans ) ) {
			this.props.fetchSitePlans( selectedSite.ID );
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

		recordTracksEvent( 'calypso_checkout_thank_you_view' );

		window.scrollTo( 0, 0 );
	}

	componentDidUpdate( prevProps: CheckoutThankYouCombinedProps ) {
		const {
			domainOnlySiteFlow,
			isFetchingSitePlugins,
			isWooCommerceInstalled,
			receiptId,
			selectedSite,
			selectedSiteSlug,
			transferComplete,
		} = this.props;

		this.redirectIfThemePurchased();

		if (
			! prevProps.receipt.hasLoadedFromServer &&
			this.props.receipt.hasLoadedFromServer &&
			this.hasPlanOrDomainProduct() &&
			this.props.selectedSite
		) {
			this.props.refreshSitePlans( this.props.selectedSite.ID );
		}

		// If the site has been transferred to Atomc and we're not already requesting the site plugins, request them.
		if ( selectedSite && transferComplete && ! isFetchingSitePlugins && ! isWooCommerceInstalled ) {
			this.props.fetchSitePlugins?.( selectedSite.ID );
		}

		// Update route when an ecommerce site goes Atomic and site slug changes
		// from 'wordpress.com` to `wpcomstaging.com`.
		if (
			selectedSiteSlug &&
			selectedSiteSlug !== prevProps.selectedSiteSlug &&
			! domainOnlySiteFlow
		) {
			const receiptPath = receiptId ? `/${ receiptId }` : '';
			page( `/checkout/thank-you/${ selectedSiteSlug }${ receiptPath }` );
		}
	}

	/**
	 * Determines whether the current checkout flow is for a redesign V2 purchase.
	 * Used for gradually rolling out the redesign.
	 *
	 * @returns {boolean} True if the checkout flow is for a redesign V2 purchase, false otherwise.
	 */
	isRedesignV2 = () => {
		// Fallback to old design when there is a failed purchase.
		const failedPurchases = getFailedPurchases( this.props );
		if ( failedPurchases.length > 0 ) {
			return false;
		}

		// ThankYou page for only purchasing a plan.
		const purchases = getPurchases( this.props );
		if ( purchases.length > 1 ) {
			return false;
		}
		return purchases.some( ( purchase ) => isPlan( purchase ) );
	};

	hasPlanOrDomainProduct = () => {
		return getPurchases( this.props ).some(
			( purchase ) => isPlan( purchase ) || isDomainProduct( purchase )
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
			( ! this.props.gsuiteReceipt || this.props.gsuiteReceipt.hasLoadedFromServer ) &&
			! this.props.isProductsListFetching
		);
	};

	isGenericReceipt = () => {
		return ! this.props.receiptId;
	};

	redirectIfThemePurchased = () => {
		// Only do theme redirect once
		const { didThemeRedirect } = this.state;
		if ( didThemeRedirect ) {
			return;
		}

		const purchases = getPurchases( this.props );

		if (
			this.props.receipt.hasLoadedFromServer &&
			purchases.length > 0 &&
			purchases.every( isThemePurchase )
		) {
			const themeId = purchases[ 0 ].meta;
			// Mark that we've done the redirect, and do the actual redirect once the state is recorded
			this.setState( { didThemeRedirect: true }, () => {
				this.props.requestThenActivate(
					themeId,
					this.props.selectedSite ? this.props.selectedSite.ID : 0,
					'calypstore',
					true
				);
				page.redirect( '/themes/' + this.props.selectedSite?.slug ?? '' );
			} );
		}
	};

	primaryCta = () => {
		const { selectedSite, upgradeIntent, redirectTo } = this.props;

		if ( this.isDataLoaded() && ! this.isGenericReceipt() ) {
			const purchases = getPurchases( this.props );
			const siteSlug = selectedSite?.slug;

			if ( ! siteSlug && getFailedPurchases( this.props ).length > 0 ) {
				return page( '/start/domain-first' );
			}

			if ( redirectTo && ! isExternal( redirectTo ) ) {
				return page( redirectTo );
			}

			switch ( upgradeIntent ) {
				case 'plugins':
				case 'themes':
					return page( `/${ upgradeIntent }/${ siteSlug }` );
			}

			if ( purchases.some( isPlan ) ) {
				return page( `/plans/my-plan/${ siteSlug }` );
			}

			if (
				purchases.some( isDomainProduct ) ||
				purchases.some( isDomainTransfer ) ||
				purchases.some( isDomainRedemption ) ||
				purchases.some( isSiteRedirect )
			) {
				return page( domainManagementList( siteSlug ) );
			}

			if ( purchases.some( isGSuiteOrExtraLicenseOrGoogleWorkspace ) ) {
				const purchase = purchases.find( isGSuiteOrExtraLicenseOrGoogleWorkspace );
				if ( purchase ) {
					return page( emailManagement( siteSlug, purchase.meta ) );
				}
			}
		}

		return page( this.props.siteHomeUrl );
	};

	getAnalyticsProperties = () => {
		const { gsuiteReceiptId, receiptId, selectedFeature: feature, selectedSite } = this.props;
		const site = selectedSite?.slug;

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
		const { translate, email, domainOnlySiteFlow, selectedFeature } = this.props;
		let purchases: ReceiptPurchase[] = [];
		let failedPurchases = [];
		let wasJetpackPlanPurchased = false;
		let wasEcommercePlanPurchased = false;
		let showHappinessSupport = ! this.isRedesignV2() && ! this.props.isSimplified;
		let wasDIFMProduct = false;
		let delayedTransferPurchase: ReceiptPurchase | undefined;
		let wasDomainProduct = false;
		let wasGSuiteOrGoogleWorkspace = false;
		let wasTitanEmailOnlyProduct = false;
		let wasTitanEmailProduct = false;
		let wasDomainOnly = false;

		if ( this.isDataLoaded() && ! this.isGenericReceipt() ) {
			purchases = getPurchases( this.props ).filter( ( purchase ) => ! isCredits( purchase ) );

			wasGSuiteOrGoogleWorkspace = purchases.some( isGSuiteOrGoogleWorkspace );
			wasTitanEmailProduct = purchases.some( isTitanMail );
			failedPurchases = getFailedPurchases( this.props );
			wasJetpackPlanPurchased = purchases.some( isJetpackPlan );
			wasEcommercePlanPurchased = purchases.some( isEcommerce );
			showHappinessSupport = showHappinessSupport && ! purchases.some( isStarter ); // Don't show support if Starter was purchased
			delayedTransferPurchase = purchases.find( isDelayedDomainTransfer );
			wasDomainProduct = purchases.some(
				( purchase ) =>
					isDomainMapping( purchase ) ||
					isDomainTransfer( purchase ) ||
					isDomainRegistration( purchase )
			);
			wasDIFMProduct = purchases.some( isDIFMProduct );
			wasTitanEmailOnlyProduct = purchases.length === 1 && purchases.some( isTitanMail );
			wasDomainOnly =
				domainOnlySiteFlow &&
				purchases.every(
					( purchase ) => isDomainMapping( purchase ) || isDomainRegistration( purchase )
				);
		} else if ( isStarterPlanEnabled() ) {
			// Don't show the Happiness support until we figure out the user doesn't have a starter plan
			showHappinessSupport = false;
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

		if ( wasDIFMProduct ) {
			return (
				<Main className="checkout-thank-you">
					<DIFMLiteThankYou />
				</Main>
			);
		}

		if ( wasEcommercePlanPurchased ) {
			// Continue to show the TransferPending progress bar until both the Atomic transfer is complete _and_ we've verified WooCommerce is finished installed.
			if ( ! this.props.transferComplete || ! this.props.isWooCommerceInstalled ) {
				return (
					<TransferPending
						orderId={ this.props.receiptId }
						siteId={ this.props.selectedSite?.ID ?? 0 }
					/>
				);
			}

			return (
				<Main className="checkout-thank-you">
					{ this.props.transferComplete && this.props.isEmailVerified && (
						<WpAdminAutoLogin
							site={ { URL: `https://${ this.props.site?.wpcom_url }` } }
							delay={ 0 }
						/>
					) }
					<PageViewTracker { ...this.getAnalyticsProperties() } title="Checkout Thank You" />
					<AtomicStoreThankYouCard siteId={ this.props.selectedSite?.ID ?? 0 } />
				</Main>
			);
		} else if ( delayedTransferPurchase ) {
			const planProps = {
				action: (
					// eslint-disable-next-line
					<a className="thank-you-card__button" onClick={ this.startTransfer }>
						{ translate( 'Start Domain Transfer' ) }
					</a>
				),
				description: translate( "Now let's get your domain transferred." ),
			};

			// domain transfer page
			return (
				<Main className="checkout-thank-you">
					<PageViewTracker { ...this.getAnalyticsProperties() } title="Checkout Thank You" />
					{ this.renderConfirmationNotice() }
					<PlanThankYouCard siteId={ this.props.selectedSite?.ID ?? 0 } { ...planProps } />
				</Main>
			);
		} else if ( wasDomainProduct ) {
			const [ purchaseType, predicate ] = this.getDomainPurchaseType( purchases );
			const [ , domainName ] = findPurchaseAndDomain( purchases, predicate );

			if ( selectedFeature === 'email-license' && domainName ) {
				return (
					<TitanSetUpThankYou
						domainName={ domainName }
						emailNeedsSetup
						isDomainOnlySite={ this.props.domainOnlySiteFlow }
						subtitle={ translate( 'You will receive an email confirmation shortly.' ) }
						title={ translate( 'Congratulations on your purchase!' ) }
					/>
				);
			}

			const professionalEmailPurchase = this.getProfessionalEmailPurchaseFromPurchases(
				predicate,
				purchases
			);

			const emailFallback = email ? email : this.props.user?.email ?? '';

			return (
				<DomainThankYou
					domain={ domainName ?? '' }
					email={ professionalEmailPurchase ? professionalEmailPurchase.meta : emailFallback }
					hasProfessionalEmail={ wasTitanEmailProduct }
					hideProfessionalEmailStep={ wasGSuiteOrGoogleWorkspace || wasDomainOnly }
					selectedSiteSlug={ this.props.selectedSiteSlug ?? '' }
					type={ purchaseType as DomainThankYouType }
				/>
			);
		} else if ( wasTitanEmailOnlyProduct ) {
			return (
				<TitanSetUpThankYou
					domainName={ purchases[ 0 ].meta }
					emailAddress={ email }
					isDomainOnlySite={ this.props.domainOnlySiteFlow }
					subtitle={ translate( 'You will receive an email confirmation shortly.' ) }
					title={ translate( 'Congratulations on your purchase!' ) }
				/>
			);
		}

		if ( this.props.domainOnlySiteFlow && purchases.length > 0 && ! failedPurchases.length ) {
			return null;
		}

		// standard thanks page
		return (
			<Main
				className={ classNames( 'checkout-thank-you', {
					'is-redesign-v2': this.isRedesignV2(),
				} ) }
			>
				<PageViewTracker { ...this.getAnalyticsProperties() } title="Checkout Thank You" />
				{ this.isRedesignV2() && (
					<MasterbarStyled
						onClick={ () => page( `/home/${ this.props.selectedSiteSlug ?? '' }` ) }
						backText={ translate( 'Back to dashboard' ) }
						canGoBack={ true }
						showContact={ true }
					/>
				) }
				<Card className="checkout-thank-you__content">{ this.productRelatedMessages() }</Card>
				{ showHappinessSupport && (
					<Card className="checkout-thank-you__footer">
						<HappinessSupport
							isJetpack={ wasJetpackPlanPurchased }
							contactButtonEventName="calypso_plans_autoconfig_chat_initiated"
						/>
					</Card>
				) }
			</Main>
		);
	}

	getProfessionalEmailPurchaseFromPurchases(
		purchaseTypePredicate: FindPredicate,
		purchases: ReceiptPurchase[]
	) {
		const titanMailPurchases = purchases.filter(
			( product ) => isTitanMail( product ) && purchaseTypePredicate( product )
		);
		if ( titanMailPurchases.length > 0 ) {
			return titanMailPurchases[ 0 ];
		}

		return null;
	}

	getDomainPurchaseType( purchases: ReceiptPurchase[] ): [ string, FindPredicate ] {
		const hasDomainMapping = purchases.some( isDomainMapping );

		if ( hasDomainMapping && purchases.some( isDomainRegistration ) ) {
			return [ 'REGISTRATION', isDomainRegistration ];
		} else if ( hasDomainMapping ) {
			return [ 'MAPPING', isDomainMapping ];
		}
		return [ 'TRANSFER', isDomainTransfer ];
	}

	startTransfer = ( event: { preventDefault: () => void } ) => {
		event.preventDefault();

		const { selectedSite } = this.props;
		const purchases = getPurchases( this.props );
		const delayedTransferPurchase = purchases.find( isDelayedDomainTransfer );

		this.props.recordStartTransferClickInThankYou( delayedTransferPurchase?.meta ?? '' );

		page(
			domainManagementTransferInPrecheck(
				selectedSite?.slug ?? '',
				delayedTransferPurchase?.meta ?? ''
			)
		);
	};

	/**
	 * Retrieves the component (and any corresponding data) that should be displayed according to the type of purchase
	 * just performed by the user.
	 *
	 * returns an array of varying size with the component instance,
	 * then an optional purchase object possibly followed by a domain name
	 */
	getComponentAndPrimaryPurchaseAndDomain = (): ComponentAndPrimaryPurchaseAndDomain => {
		if ( ! this.isDataLoaded() || this.isGenericReceipt() ) {
			return [];
		}
		const purchases = getPurchases( this.props );
		const failedPurchases = getFailedPurchases( this.props );
		const hasFailedPurchases = failedPurchases.length > 0;
		if ( hasFailedPurchases ) {
			return [ 'failed-purchase-details' ];
		}
		if ( purchases.some( isJetpackPlan ) ) {
			return [ 'jetpack-plan-details', purchases.find( isJetpackPlan ) ];
		}
		if ( purchases.some( isBlogger ) ) {
			return [ 'blogger-plan-details', purchases.find( isBlogger ) ];
		}
		if ( purchases.some( isPersonal ) ) {
			return [ 'personal-plan-details', purchases.find( isPersonal ) ];
		}
		if ( purchases.some( isStarter ) ) {
			return [ 'starter-plan-details', purchases.find( isStarter ) ];
		}
		if ( purchases.some( isPremium ) ) {
			return [ 'premium-plan-details', purchases.find( isPremium ) ];
		}
		if ( purchases.some( isBusiness ) ) {
			return [ 'business-plan-details', purchases.find( isBusiness ) ];
		}
		if ( purchases.some( isPro ) ) {
			return [ 'pro-plan-details', purchases.find( isPro ) ];
		}
		if ( purchases.some( isEcommerce ) ) {
			return [ 'ecommerce-plan-details', purchases.find( isEcommerce ) ];
		}
		if ( purchases.some( isDomainRegistration ) ) {
			return [
				'domain-registration-details',
				...findPurchaseAndDomain( purchases, isDomainRegistration ),
			];
		}
		if ( purchases.some( isGSuiteOrExtraLicenseOrGoogleWorkspace ) ) {
			return [
				'google-apps-details',
				...findPurchaseAndDomain( purchases, isGSuiteOrExtraLicenseOrGoogleWorkspace ),
			];
		}
		if ( purchases.some( isDomainMapping ) ) {
			return [ 'domain-mapping-details', ...findPurchaseAndDomain( purchases, isDomainMapping ) ];
		}
		if ( purchases.some( isSiteRedirect ) ) {
			return [ 'site-redirect-details', ...findPurchaseAndDomain( purchases, isSiteRedirect ) ];
		}
		if ( purchases.some( isDomainTransfer ) ) {
			return [ false, ...findPurchaseAndDomain( purchases, isDomainTransfer ) ];
		}
		if ( purchases.some( isTitanMail ) ) {
			return [ false, ...findPurchaseAndDomain( purchases, isTitanMail ) ];
		}
		if ( purchases.some( isChargeback ) ) {
			return [ 'chargeback-details', purchases.find( isChargeback ) ];
		}
		return [];
	};

	productRelatedMessages = () => {
		const { selectedSite, siteUnlaunchedBeforeUpgrade, upgradeIntent, isSimplified, displayMode } =
			this.props;
		const purchases = getPurchases( this.props );
		const failedPurchases = getFailedPurchases( this.props );
		const hasFailedPurchases = failedPurchases.length > 0;
		const componentAndPrimaryPurchaseAndDomain = this.getComponentAndPrimaryPurchaseAndDomain();
		const [ component, primaryPurchase ] = componentAndPrimaryPurchaseAndDomain;

		if ( ! this.isDataLoaded() ) {
			return (
				<div>
					<CheckoutThankYouHeader
						isDataLoaded={ false }
						isSimplified={ isSimplified }
						selectedSite={ selectedSite }
						upgradeIntent={ upgradeIntent }
						siteUnlaunchedBeforeUpgrade={ siteUnlaunchedBeforeUpgrade }
						displayMode={ displayMode }
					/>

					{ ! isSimplified && (
						<>
							<CheckoutThankYouFeaturesHeader isDataLoaded={ false } />

							<div className="checkout-thank-you__purchase-details-list">
								<PurchaseDetail isPlaceholder />
								<PurchaseDetail isPlaceholder />
								<PurchaseDetail isPlaceholder />
							</div>
						</>
					) }
				</div>
			);
		}

		return (
			<div>
				<CheckoutThankYouHeader
					isDataLoaded={ this.isDataLoaded() }
					isSimplified={ isSimplified }
					primaryPurchase={ primaryPurchase }
					selectedSite={ selectedSite }
					hasFailedPurchases={ hasFailedPurchases }
					siteUnlaunchedBeforeUpgrade={ siteUnlaunchedBeforeUpgrade }
					upgradeIntent={ upgradeIntent }
					primaryCta={ this.primaryCta }
					displayMode={ displayMode }
					purchases={ purchases }
					isRedesignV2={ this.isRedesignV2() }
				>
					{ ! this.isRedesignV2() && ! isSimplified && primaryPurchase && (
						<CheckoutThankYouFeaturesHeader
							isDataLoaded={ this.isDataLoaded() }
							isGenericReceipt={ this.isGenericReceipt() }
							purchases={ purchases }
							hasFailedPurchases={ hasFailedPurchases }
						/>
					) }

					{ ! isSimplified && component && (
						<div className="checkout-thank-you__purchase-details-list">
							{ this.isRedesignV2() ? (
								<Footer />
							) : (
								<PurchaseDetailsWrapper
									{ ...this.props }
									componentAndPrimaryPurchaseAndDomain={ componentAndPrimaryPurchaseAndDomain }
								/>
							) }
						</div>
					) }
				</CheckoutThankYouHeader>
			</div>
		);
	};
}

function isWooCommercePluginInstalled( sitePlugins: { slug: string }[] ) {
	return sitePlugins.length > 0 && sitePlugins.some( ( item ) => item.slug === 'woocommerce' );
}

export default connect(
	( state: IAppState, props: CheckoutThankYouProps ) => {
		const siteId = getSelectedSiteId( state );
		const activeTheme = getActiveTheme( state, siteId ?? 0 );
		const sitePlugins = getInstalledPlugins( state, [ siteId ] );

		return {
			isProductsListFetching: isProductsListFetching( state ),
			receipt: getReceiptById( state, props.receiptId ),
			gsuiteReceipt: props.gsuiteReceiptId ? getReceiptById( state, props.gsuiteReceiptId ) : null,
			sitePlans: getPlansBySite( state, props.selectedSite ),
			isWooCommerceInstalled: isWooCommercePluginInstalled( sitePlugins ),
			isFetchingSitePlugins: isRequestingSitePlugins( state, siteId ),
			upgradeIntent: props.upgradeIntent || getCheckoutUpgradeIntent( state ),
			isSimplified:
				[ 'install_theme', 'install_plugin', 'browse_plugins' ].indexOf( props.upgradeIntent ) !==
				-1,
			user: getCurrentUser( state ),
			userDate: getCurrentUserDate( state ),
			transferComplete: transferStates.COMPLETED === getAtomicTransfer( state, siteId ).status,
			isEmailVerified: isCurrentUserEmailVerified( state ),
			selectedSiteSlug: getSiteSlug( state, siteId ),
			siteHomeUrl: getSiteHomeUrl( state, siteId ),
			customizeUrl:
				activeTheme && siteId
					? getCustomizeOrEditFrontPageUrl( state, activeTheme, siteId )
					: undefined,
			site: siteId ? getSite( state, siteId ) : null,
		};
	},
	{
		fetchAtomicTransfer,
		fetchSitePlugins,
		fetchReceipt,
		fetchSitePlans,
		refreshSitePlans,
		recordStartTransferClickInThankYou,
		requestThenActivate,
	}
)( localize( CheckoutThankYou ) );

/**
 * Retrieves the component (and any corresponding data) that should be displayed according to the type of purchase
 * just performed by the user.
 */
function PurchaseDetailsWrapper(
	props: CheckoutThankYouCombinedProps & {
		componentAndPrimaryPurchaseAndDomain: ComponentAndPrimaryPurchaseAndDomain;
	}
): JSX.Element | null {
	const purchases = getPurchases( props );
	const failedPurchases = getFailedPurchases( props );
	const hasFailedPurchases = failedPurchases.length > 0;
	const [ component, primaryPurchase, domain ] = props.componentAndPrimaryPurchaseAndDomain;
	const primaryPurchaseSupportUrl = primaryPurchase?.registrarSupportUrl ?? null;
	const isGenericReceipt = ! props.receiptId;
	const registrarSupportUrl =
		! component || isGenericReceipt || hasFailedPurchases ? null : primaryPurchaseSupportUrl;
	const isRootDomainWithUs = primaryPurchase?.isRootDomainWithUs ?? false;

	if ( hasFailedPurchases ) {
		return <FailedPurchaseDetails purchases={ purchases } failedPurchases={ failedPurchases } />;
	}

	if ( purchases.some( isJetpackPlan ) ) {
		return (
			<JetpackPlanDetails
				customizeUrl={ props.customizeUrl }
				domain={ domain }
				purchases={ purchases }
				failedPurchases={ failedPurchases }
				isRootDomainWithUs={ isRootDomainWithUs }
				registrarSupportUrl={ registrarSupportUrl }
				selectedSite={ props.selectedSite }
				selectedFeature={ getFeatureByKey( props.selectedFeature ) }
				sitePlans={ props.sitePlans }
			/>
		);
	}
	if ( purchases.some( isBlogger ) ) {
		return (
			<BloggerPlanDetails
				purchases={ purchases }
				selectedSite={ props.selectedSite }
				sitePlans={ props.sitePlans }
			/>
		);
	}
	if ( purchases.some( isPersonal ) ) {
		return (
			<PersonalPlanDetails
				purchases={ purchases }
				selectedSite={ props.selectedSite }
				sitePlans={ props.sitePlans }
			/>
		);
	}
	if ( purchases.some( isStarter ) ) {
		return (
			<StarterPlanDetails
				purchases={ purchases }
				selectedSite={ props.selectedSite }
				sitePlans={ props.sitePlans }
			/>
		);
	}
	if ( purchases.some( isPremium ) && props.selectedSite ) {
		return (
			<PremiumPlanDetails
				customizeUrl={ props.customizeUrl }
				purchases={ purchases }
				selectedSite={ props.selectedSite }
				selectedFeature={ getFeatureByKey( props.selectedFeature ) }
				sitePlans={ props.sitePlans }
			/>
		);
	}
	if ( purchases.some( isBusiness ) && props.selectedSite ) {
		return (
			<BusinessPlanDetails
				purchases={ purchases }
				selectedSite={ props.selectedSite }
				selectedFeature={ getFeatureByKey( props.selectedFeature ) }
				sitePlans={ props.sitePlans }
			/>
		);
	}
	if ( purchases.some( isPro ) && props.selectedSite ) {
		return (
			<ProPlanDetails
				purchases={ purchases }
				selectedSite={ props.selectedSite }
				selectedFeature={ getFeatureByKey( props.selectedFeature ) }
				sitePlans={ props.sitePlans }
			/>
		);
	}
	if ( purchases.some( isEcommerce ) && props.selectedSite ) {
		return (
			<EcommercePlanDetails
				purchases={ purchases }
				selectedSite={ props.selectedSite }
				selectedFeature={ getFeatureByKey( props.selectedFeature ) }
				sitePlans={ props.sitePlans }
			/>
		);
	}
	if ( purchases.some( isDomainRegistration ) && domain && props.selectedSite ) {
		return (
			<DomainRegistrationDetails
				purchases={ purchases }
				domain={ domain }
				selectedSite={ props.selectedSite }
			/>
		);
	}
	if ( purchases.some( isGSuiteOrExtraLicenseOrGoogleWorkspace ) ) {
		return <GoogleAppsDetails purchases={ purchases } />;
	}
	if ( purchases.some( isDomainMapping ) ) {
		return <DomainMappingDetails domain={ domain } isRootDomainWithUs={ isRootDomainWithUs } />;
	}
	if ( purchases.some( isSiteRedirect ) && domain && props.selectedSite ) {
		return <SiteRedirectDetails domain={ domain } selectedSite={ props.selectedSite } />;
	}
	if ( purchases.some( isChargeback ) && props.selectedSite ) {
		return <ChargebackDetails selectedSite={ props.selectedSite } />;
	}
	return null;
}
