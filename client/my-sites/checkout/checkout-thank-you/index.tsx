import {
	isCredits,
	isDelayedDomainTransfer,
	isDomainProduct,
	isDomainRedemption,
	isDomainRegistration,
	isDomainTransfer,
	isEcommerce,
	isGSuiteOrExtraLicenseOrGoogleWorkspace,
	isJetpackPlan,
	isPlan,
	isSiteRedirect,
	isStarter,
	isThemePurchase,
	isTitanMail,
	shouldFetchSitePlans,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Card } from '@automattic/components';
import { dispatch } from '@wordpress/data';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import PlanThankYouCard from 'calypso/blocks/plan-thank-you-card';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import HappinessSupport from 'calypso/components/happiness-support';
import Main from 'calypso/components/main';
import Notice from 'calypso/components/notice';
import { debug, TRACKING_IDS } from 'calypso/lib/analytics/ad-tracking/constants';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { mayWeTrackByTracker } from 'calypso/lib/analytics/tracker-buckets';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { isExternal } from 'calypso/lib/url';
import {
	domainManagementList,
	domainManagementTransferInPrecheck,
} from 'calypso/my-sites/domains/paths';
import { GoogleWorkspaceSetUpThankYou } from 'calypso/my-sites/email/google-workspace-set-up-thank-you';
import { getEmailManagementPath } from 'calypso/my-sites/email/paths';
import TitanSetUpThankYou from 'calypso/my-sites/email/titan-set-up-thank-you';
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
	isRequesting as isRequestingSitePlugins,
	getPlugins as getInstalledPlugins,
} from 'calypso/state/plugins/installed/selectors';
import { isProductsListFetching } from 'calypso/state/products-list/selectors';
import { fetchReceipt } from 'calypso/state/receipts/actions';
import { getReceiptById } from 'calypso/state/receipts/selectors';
import getAtomicTransfer from 'calypso/state/selectors/get-atomic-transfer';
import getCheckoutUpgradeIntent from 'calypso/state/selectors/get-checkout-upgrade-intent';
import getCustomizeOrEditFrontPageUrl from 'calypso/state/selectors/get-customize-or-edit-front-page-url';
import { requestSite } from 'calypso/state/sites/actions';
import { fetchSitePlans, refreshSitePlans } from 'calypso/state/sites/plans/actions';
import { getPlansBySite } from 'calypso/state/sites/plans/selectors';
import { getSiteHomeUrl, getSiteSlug, getSite } from 'calypso/state/sites/selectors';
import { requestThenActivate } from 'calypso/state/themes/actions';
import { getActiveTheme } from 'calypso/state/themes/selectors';
import { IAppState } from 'calypso/state/types';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import CheckoutThankYouHeader from './header';
import MasterbarStyled from './redesign-v2/masterbar-styled';
import DomainBulkTransferThankYou from './redesign-v2/pages/domain-bulk-transfer';
import DomainOnlyThankYou from './redesign-v2/pages/domain-only';
import GenericThankYou from './redesign-v2/pages/generic';
import JetpackSearchThankYou from './redesign-v2/pages/jetpack-search';
import { PlaceholderThankYou } from './redesign-v2/pages/placeholder';
import PlanOnlyThankYou from './redesign-v2/pages/plan-only';
import { isRefactoredForThankYouV2 } from './redesign-v2/utils';
import TransferPending from './transfer-pending';
import './style.scss';
import {
	getDomainPurchase,
	isOnlyDomainTransfers,
	isOnlyDomainPurchases,
	isSearch,
	isTitanWithoutMailboxes,
} from './utils';
import type { FindPredicate } from './utils';
import type { SitesPlansResult } from '../src/hooks/product-variants';
import type { OnboardActions, SiteDetails } from '@automattic/data-stores';
import type { UserData } from 'calypso/lib/user/user';
import type { ReceiptState, ReceiptPurchase } from 'calypso/state/receipts/types';
import type { LocalizeProps } from 'i18n-calypso';

declare global {
	interface Window {
		fbq: ( ...args: any[] ) => void;
	}
}

export interface CheckoutThankYouProps {
	domainOnlySiteFlow: boolean;
	email: string;
	receiptId: number;
	gsuiteReceiptId: number;
	selectedFeature: string;
	selectedSite: null | SiteDetails;
	upgradeIntent: string;
	redirectTo?: string;
	displayMode?: string;
}

export interface CheckoutThankYouConnectedProps {
	isLoadingPurchases: boolean;
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
		purchased?: boolean
	) => void;
	requestSite: ( siteId: number ) => void;
}

interface CheckoutThankYouState {
	didThemeRedirect: boolean;
}

export type CheckoutThankYouCombinedProps = CheckoutThankYouProps &
	CheckoutThankYouConnectedProps &
	LocalizeProps;

export function getPurchases( props: CheckoutThankYouCombinedProps ): ReceiptPurchase[] {
	return [
		...( props?.receipt?.data?.purchases ?? [] ),
		...( props?.gsuiteReceipt?.data?.purchases ?? [] ),
	];
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

		if ( isOnlyDomainTransfers( getPurchases( this.props ) ) ) {
			// We need to reset the store upon checkout completion, on the bulk domain transfer flow
			// We do it dinamically to avoid loading unnecessary javascript if not necessary.
			import( 'calypso/landing/stepper/stores' ).then( ( imports ) =>
				( dispatch( imports.ONBOARD_STORE ) as OnboardActions ).resetOnboardStore()
			);

			if ( mayWeTrackByTracker( 'googleAds' ) ) {
				const params: [ 'event', 'conversion', { send_to: string } ] = [
					'event',
					'conversion',
					{ send_to: TRACKING_IDS.wpcomGoogleAdsGtagDomainTransferPurchase } as { send_to: string },
				];
				debug( 'recordOrderInGoogleAds: WPCom Domain Transfer Purchase', params );
				window.gtag( ...params );
			}

			// Custom conversion for Facebook Ads/audiences
			if ( mayWeTrackByTracker( 'facebook' ) ) {
				const params = [ 'trackCustom', 'BulkDomainTransfer', {} ];

				debug( 'recordOrderInFacebookAds: WPCom Bulk Domain Transfer Purchase', params );
				window.fbq && window.fbq( ...params );
			}

			// Custom conversion for Twitter Ads.
			if ( mayWeTrackByTracker( 'twitter' ) ) {
				const params = [ 'event', 'tw-nvzbs-ofqri', {} ];
				debug( 'recordOrder: [Twitter], BulkDomainTransfer', params );
				window.twq( ...params );
			}
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
			this.hasPlanOrDomainProduct()
		) {
			if ( this.props.selectedSite ) {
				this.props.refreshSitePlans( this.props.selectedSite.ID );
			}

			if ( this.props.domainOnlySiteFlow ) {
				const [ domainOnlyPurchase ] = findPurchaseAndDomain(
					getPurchases( this.props ),
					isDomainRegistration
				);

				if ( domainOnlyPurchase?.blogId ) {
					this.props.requestSite( domainOnlyPurchase.blogId );
				}
			}
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

		if ( ! this.isGenericReceipt() ) {
			const purchases = getPurchases( this.props );
			const siteSlug = selectedSite?.slug;

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
					return page( getEmailManagementPath( siteSlug, purchase.meta ) );
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

	getMasterBar = () => {
		const { translate } = this.props;
		const purchases = getPurchases( this.props );
		const wasEcommercePlanPurchased = purchases.some( isEcommerce );

		const siteId = this.props.selectedSite?.ID;
		const siteSlug = this.props.selectedSite?.slug;

		return (
			<MasterbarStyled
				onClick={ () => page( `/home/${ siteSlug ?? '' }` ) }
				backText={ translate( 'Back to dashboard' ) }
				canGoBack={ !! siteId && ! wasEcommercePlanPurchased } // Back button is hidden for E-Commcerce Plans as a workaround to avoid taking users back to the loading page.
				showContact
			/>
		);
	};

	render() {
		const { translate, email, selectedFeature } = this.props;
		const purchases = getPurchases( this.props ).filter( ( purchase ) => ! isCredits( purchase ) );
		let wasJetpackPlanPurchased = false;
		let wasEcommercePlanPurchased = false;
		let showHappinessSupport = ! this.props.isSimplified;
		let delayedTransferPurchase: ReceiptPurchase | undefined;

		if ( ! this.isDataLoaded() ) {
			return (
				<>
					{ this.getMasterBar() }
					<PlaceholderThankYou />
				</>
			);
		}

		if ( ! this.isGenericReceipt() ) {
			wasJetpackPlanPurchased = purchases.some( isJetpackPlan );
			wasEcommercePlanPurchased = purchases.some( isEcommerce );
			showHappinessSupport = showHappinessSupport && ! purchases.some( isStarter ); // Don't show support if Starter was purchased
			delayedTransferPurchase = purchases.find( isDelayedDomainTransfer );
		}

		// Continue to show the TransferPending progress bar until both the Atomic transfer is complete
		// _and_ we've verified WooCommerce is finished installed.
		if (
			wasEcommercePlanPurchased &&
			( ! this.props.transferComplete || ! this.props.isWooCommerceInstalled )
		) {
			return (
				<TransferPending
					orderId={ this.props.receiptId }
					siteId={ this.props.selectedSite?.ID ?? 0 }
				/>
			);
		}

		/** REFACTORED REDESIGN */
		if ( isRefactoredForThankYouV2( this.props ) ) {
			let pageContent = null;
			const domainPurchase = getDomainPurchase( purchases );
			const gSuiteOrExtraLicenseOrGoogleWorkspace = purchases.find(
				isGSuiteOrExtraLicenseOrGoogleWorkspace
			);

			if ( isOnlyDomainTransfers( purchases ) ) {
				pageContent = (
					<DomainBulkTransferThankYou
						purchases={ purchases }
						currency={ this.props.receipt.data?.currency ?? 'USD' }
					/>
				);
			} else if ( this.props.receipt.data && isOnlyDomainPurchases( purchases ) ) {
				pageContent = (
					<DomainOnlyThankYou
						purchases={ purchases }
						receipt={ this.props.receipt.data }
						isGravatarDomain={ !! this.props.receipt.data?.isGravatarDomain }
					/>
				);
			} else if ( purchases.length === 1 && isPlan( purchases[ 0 ] ) ) {
				pageContent = (
					<PlanOnlyThankYou
						primaryPurchase={ purchases[ 0 ] }
						isEmailVerified={ this.props.isEmailVerified }
						transferComplete={ this.props.transferComplete }
					/>
				);
			} else if ( purchases.length === 1 && isSearch( purchases[ 0 ] ) ) {
				pageContent = <JetpackSearchThankYou purchase={ purchases[ 0 ] } />;
			} else if ( purchases.length === 1 && isTitanMail( purchases[ 0 ] ) ) {
				pageContent = (
					<TitanSetUpThankYou
						domainName={ purchases[ 0 ].meta }
						numberOfMailboxesPurchased={ purchases[ 0 ].newQuantity }
						emailAddress={ email }
						isDomainOnlySite={ this.props.domainOnlySiteFlow }
					/>
				);
			} else if ( isTitanWithoutMailboxes( selectedFeature ) && domainPurchase ) {
				pageContent = (
					<TitanSetUpThankYou
						domainName={ domainPurchase.meta }
						isDomainOnlySite={ this.props.domainOnlySiteFlow }
					/>
				);
			} else if ( gSuiteOrExtraLicenseOrGoogleWorkspace ) {
				pageContent = (
					<GoogleWorkspaceSetUpThankYou purchase={ gSuiteOrExtraLicenseOrGoogleWorkspace } />
				);
			} else {
				pageContent = <GenericThankYou purchases={ purchases } emailAddress={ email } />;
			}

			if ( pageContent ) {
				const siteId = this.props.selectedSite?.ID;

				return (
					<Main className="checkout-thank-you is-redesign-v2">
						<PageViewTracker { ...this.getAnalyticsProperties() } title="Checkout Thank You" />

						{ siteId && <QuerySitePurchases siteId={ siteId } /> }

						{ this.getMasterBar() }

						{ pageContent }
					</Main>
				);
			}
		}

		/** LEGACY - The ultimate goal is to remove everything below */
		if ( delayedTransferPurchase ) {
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
		}

		// standard thanks page
		return (
			<Main className="checkout-thank-you">
				<PageViewTracker { ...this.getAnalyticsProperties() } title="Checkout Thank You" />
				<Card className="checkout-thank-you__content">
					<div>
						<CheckoutThankYouHeader
							selectedSite={ this.props.selectedSite }
							upgradeIntent={ this.props.upgradeIntent }
							primaryCta={ this.primaryCta }
							displayMode={ this.props.displayMode }
							purchases={ purchases }
							currency={ this.props.receipt.data?.currency }
						/>
					</div>
				</Card>
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
}

function isWooCommercePluginInstalled( sitePlugins: { slug: string }[] ) {
	return sitePlugins.length > 0 && sitePlugins.some( ( item ) => item.slug === 'woocommerce' );
}

export default connect(
	( state: IAppState, props: CheckoutThankYouProps ) => {
		let siteId = getSelectedSiteId( state );
		const activeTheme = getActiveTheme( state, siteId ?? 0 );
		const sitePlugins = getInstalledPlugins( state, [ siteId ] );
		const receipt = getReceiptById( state, props.receiptId );

		if ( props.domainOnlySiteFlow && receipt.hasLoadedFromServer ) {
			const [ domainOnlyPurchase ] = findPurchaseAndDomain(
				receipt.data?.purchases ?? [],
				isDomainRegistration
			);
			if ( domainOnlyPurchase?.blogId ) {
				siteId = domainOnlyPurchase.blogId;
			}
		}

		return {
			isProductsListFetching: isProductsListFetching( state ),
			receipt,
			gsuiteReceipt: props.gsuiteReceiptId ? getReceiptById( state, props.gsuiteReceiptId ) : null,
			sitePlans: getPlansBySite( state, props.selectedSite ),
			isFetchingSitePlugins: isRequestingSitePlugins( state, siteId ),
			isWooCommerceInstalled: isWooCommercePluginInstalled( sitePlugins ),
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
		requestSite,
	}
)( localize( CheckoutThankYou ) );
