import {
	getPlan,
	JETPACK_LEGACY_PLANS,
	PLAN_100_YEARS,
	PLAN_JETPACK_SECURITY_DAILY,
	PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	PLAN_JETPACK_SECURITY_REALTIME,
	PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
	JETPACK_ANTI_SPAM_PRODUCTS,
	JETPACK_BACKUP_PRODUCTS,
	JETPACK_SCAN_PRODUCTS,
	JETPACK_SEARCH_PRODUCTS,
	JETPACK_VIDEOPRESS_PRODUCTS,
	isFreeJetpackPlan,
	isFreePlanProduct,
	PLAN_ECOMMERCE_TRIAL_MONTHLY,
	PLAN_MIGRATION_TRIAL_MONTHLY,
	PLAN_HOSTING_TRIAL_MONTHLY,
	JETPACK_COMPLETE_PLANS,
} from '@automattic/calypso-products';
import { Dialog } from '@automattic/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import DocumentHead from 'calypso/components/data/document-head';
import QueryConciergeInitial from 'calypso/components/data/query-concierge-initial';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import QuerySiteProducts from 'calypso/components/data/query-site-products';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import QuerySites from 'calypso/components/data/query-sites';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { isCloseToExpiration } from 'calypso/me/purchases/lib/raw-purchase-helpers';
import DomainWarnings from 'calypso/my-sites/domains/components/domain-warnings';
import JetpackChecklist from 'calypso/my-sites/plans/current-plan/jetpack-checklist';
import PlanRenewalMessage from 'calypso/my-sites/plans/jetpack-plans/plan-renewal-message';
import ModernizedLayout from 'calypso/my-sites/plans/modernized-layout';
import PlansNavigation from 'calypso/my-sites/plans/navigation';
import { getRawSitePurchases } from 'calypso/state/purchases/selectors';
import getConciergeScheduleId from 'calypso/state/selectors/get-concierge-schedule-id';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getCurrentPlan, isRequestingSitePlans } from 'calypso/state/sites/plans/selectors';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import AntiSpamProductThankYou from './current-plan-thank-you/anti-spam-thank-you';
import BackupProductThankYou from './current-plan-thank-you/backup-thank-you';
import FreePlanThankYou from './current-plan-thank-you/free-plan-thank-you';
import JetpackCompleteThankYou from './current-plan-thank-you/jetpack-complete';
import JetpackSecurityDailyThankYou from './current-plan-thank-you/jetpack-security-daily';
import JetpackSecurityRealtimeThankYou from './current-plan-thank-you/jetpack-security-realtime';
import VideoPressProductThankYou from './current-plan-thank-you/jetpack-videopress-thank-you';
import PaidPlanThankYou from './current-plan-thank-you/paid-plan-thank-you';
import ScanProductThankYou from './current-plan-thank-you/scan-thank-you';
import SearchProductThankYou from './current-plan-thank-you/search-thank-you';
import PurchasesListing from './purchases-listing';
import TrialCurrentPlan from './trials/trial-current-plan';
import type { Purchase } from '@automattic/api-core';
import type { SiteDetails } from '@automattic/data-stores';
import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { SitePlanData } from 'calypso/state/sites/plans/types';
import type { AppState } from 'calypso/types';
import type { LocalizeProps } from 'i18n-calypso';

import './style.scss';

const loadProductPurchaseFeaturesList = () =>
	import(
		/* webpackChunkName: "async-load-calypso-blocks-product-purchase-features-list" */ 'calypso/blocks/product-purchase-features-list'
	);

interface OwnProps {
	path: string;
	product?: string;
	requestThankYou?: boolean;
}

interface ConnectedProps {
	currentPlan: SitePlanData | null;
	domains: ResponseDomain[];
	hasDomainsLoaded: boolean;
	isJetpackNotAtomic: boolean | null;
	isRequestingSitePlans: boolean;
	purchases: Purchase[];
	scheduleId: number | null;
	selectedSite: SiteDetails | null | undefined;
	selectedSiteId: number | null;
	shouldShowDomainWarnings: boolean | null;
	showJetpackChecklist: boolean | null;
	showThankYou: boolean | null | undefined;
}

type Props = OwnProps & ConnectedProps & LocalizeProps;

class CurrentPlan extends Component< Props, { hideThankYouModal: boolean } > {
	state = {
		hideThankYouModal: false,
	};

	componentDidMount() {
		if ( typeof window !== 'undefined' ) {
			window.scrollTo( 0, 0 );
		}
	}

	isLoading() {
		const { selectedSite, isRequestingSitePlans: isRequestingPlans, scheduleId } = this.props;

		return ! selectedSite || isRequestingPlans || null === scheduleId;
	}

	hideThankYouModalOnClose = () => {
		this.setState( {
			hideThankYouModal: true,
		} );
	};

	isThankYouProduct( productSlugs: readonly string[] ) {
		const { product } = this.props;

		return !! product && productSlugs.includes( product );
	}

	renderThankYou() {
		const { currentPlan } = this.props;

		if ( this.isThankYouProduct( JETPACK_BACKUP_PRODUCTS ) ) {
			return <BackupProductThankYou />;
		}

		if ( this.isThankYouProduct( JETPACK_SCAN_PRODUCTS ) ) {
			return <ScanProductThankYou />;
		}

		if ( this.isThankYouProduct( JETPACK_ANTI_SPAM_PRODUCTS ) ) {
			return <AntiSpamProductThankYou />;
		}

		if ( this.isThankYouProduct( JETPACK_VIDEOPRESS_PRODUCTS ) ) {
			return <VideoPressProductThankYou />;
		}

		if ( this.isThankYouProduct( JETPACK_SEARCH_PRODUCTS ) ) {
			return <SearchProductThankYou />;
		}

		if (
			this.isThankYouProduct( [ PLAN_JETPACK_SECURITY_DAILY, PLAN_JETPACK_SECURITY_DAILY_MONTHLY ] )
		) {
			return <JetpackSecurityDailyThankYou />;
		}

		if (
			this.isThankYouProduct( [
				PLAN_JETPACK_SECURITY_REALTIME,
				PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
			] )
		) {
			return <JetpackSecurityRealtimeThankYou />;
		}

		if ( this.isThankYouProduct( JETPACK_COMPLETE_PLANS ) ) {
			return <JetpackCompleteThankYou />;
		}

		if ( ! currentPlan || isFreePlanProduct( currentPlan ) || isFreeJetpackPlan( currentPlan ) ) {
			return <FreePlanThankYou />;
		}

		return <PaidPlanThankYou />;
	}

	renderMain() {
		const { selectedSiteId, selectedSite, showJetpackChecklist, translate } = this.props;
		const isLoading = this.isLoading();
		const currentPlanSlug = selectedSite?.plan?.product_slug ?? '';
		const currentPlan = getPlan( currentPlanSlug );
		const planTitle = currentPlan ? currentPlan.getTitle() : '';
		const planFeaturesHeader =
			currentPlanSlug === PLAN_100_YEARS
				? translate( 'Features included in your 100-Year Plan' )
				: translate( '{{planName/}} plan features', {
						components: { planName: <>{ planTitle }</> },
					} );

		return (
			<>
				<PurchasesListing />

				{ showJetpackChecklist && (
					<Fragment>
						<QueryJetpackPlugins siteIds={ [ selectedSiteId ] } />
						<JetpackChecklist />
					</Fragment>
				) }

				<div
					className={ clsx( 'current-plan__header-text current-plan__text', {
						'is-placeholder': { isLoading },
					} ) }
				>
					<h1 className="current-plan__header-heading">{ planFeaturesHeader }</h1>
				</div>
				<AsyncLoad
					require={ loadProductPurchaseFeaturesList }
					placeholder={ null }
					plan={ currentPlanSlug }
					isPlaceholder={ isLoading }
				/>
			</>
		);
	}

	renderTrialPage() {
		return <TrialCurrentPlan />;
	}

	render() {
		const {
			domains,
			purchases,
			hasDomainsLoaded,
			path,
			selectedSite,
			selectedSiteId,
			shouldShowDomainWarnings,
			showThankYou,
			translate,
			isJetpackNotAtomic,
		} = this.props;

		const currentPlanSlug = selectedSite?.plan?.product_slug ?? '';
		const isEcommerceTrial = currentPlanSlug === PLAN_ECOMMERCE_TRIAL_MONTHLY;
		const isBusinessTrial =
			currentPlanSlug === PLAN_MIGRATION_TRIAL_MONTHLY ||
			currentPlanSlug === PLAN_HOSTING_TRIAL_MONTHLY;
		const isTrial = isEcommerceTrial || isBusinessTrial;
		const shouldQuerySiteDomains = selectedSiteId && shouldShowDomainWarnings;
		const showDomainWarnings = hasDomainsLoaded && shouldShowDomainWarnings;

		let showExpiryNotice = false;

		if ( ( JETPACK_LEGACY_PLANS as readonly string[] ).includes( currentPlanSlug ) ) {
			const purchase = purchases?.find( ( { product_slug } ) => product_slug === currentPlanSlug );
			showExpiryNotice = !! purchase && isCloseToExpiration( purchase );
		}

		const planDescription = isJetpackNotAtomic
			? translate( 'Learn about the features included in your Jetpack plan.' )
			: translate( 'Learn about the features included in your WordPress.com plan.' );

		return (
			<div>
				<ModernizedLayout />
				<DocumentHead title={ translate( 'My Plan' ) } />
				{ selectedSiteId && (
					<QueryConciergeInitial key={ selectedSiteId } siteId={ selectedSiteId } />
				) }
				<QuerySites siteId={ selectedSiteId } />
				<QuerySitePlans siteId={ selectedSiteId } />
				<QuerySitePurchases siteId={ selectedSiteId } />
				<QuerySiteProducts siteId={ selectedSiteId } />
				{ shouldQuerySiteDomains && <QuerySiteDomains siteId={ selectedSiteId } /> }
				<div>
					<NavigationHeader
						className="plans__section-header"
						navigationItems={ [] }
						title={ translate( 'Plans' ) }
						subtitle={ planDescription }
					/>
					<div className="current-plan current-plan__content">
						{ showThankYou && ! this.state.hideThankYouModal && (
							<Dialog
								baseClassName="current-plan__dialog dialog__content dialog__backdrop"
								isVisible={ showThankYou }
								onClose={ this.hideThankYouModalOnClose }
							>
								{ this.renderThankYou() }
							</Dialog>
						) }

						<PlansNavigation path={ path } />

						<Main fullWidthLayout>
							{ showDomainWarnings && (
								<DomainWarnings
									domains={ domains }
									position="current-plan"
									selectedSite={ selectedSite }
									allowedRules={ [
										'newDomainsWithPrimary',
										'newDomains',
										'unverifiedDomainsCanManage',
										'unverifiedDomainsCannotManage',
										'wrongNSMappedDomains',
										'newTransfersWrongNS',
									] }
								/>
							) }

							{ showExpiryNotice && (
								<Notice status="is-info" text={ <PlanRenewalMessage /> } showDismiss={ false }>
									<NoticeAction href={ `/plans/${ selectedSite?.slug || '' }` }>
										{ translate( 'View plans' ) }
									</NoticeAction>
								</Notice>
							) }

							{ isTrial ? this.renderTrialPage() : this.renderMain() }

							<TrackComponentView eventName="calypso_plans_my_plan_view" />
						</Main>
					</div>
				</div>
			</div>
		);
	}
}

export default connect( ( state: AppState, { requestThankYou }: OwnProps ) => {
	const selectedSite = getSelectedSite( state );
	const selectedSiteId = getSelectedSiteId( state );
	const domains = getDomainsBySiteId( state, selectedSiteId );
	const purchases = getRawSitePurchases( state, selectedSiteId );

	const isJetpack = isJetpackSite( state, selectedSiteId );
	const isAutomatedTransfer = isSiteAutomatedTransfer( state, selectedSiteId );

	const isJetpackNotAtomic = false === isAutomatedTransfer && isJetpack;

	const currentPlan = getCurrentPlan( state, selectedSiteId );

	return {
		currentPlan,
		domains,
		purchases,
		hasDomainsLoaded: !! domains,
		isRequestingSitePlans: isRequestingSitePlans( state, selectedSiteId ),
		selectedSite,
		selectedSiteId,
		shouldShowDomainWarnings: ! isJetpack || isAutomatedTransfer,
		showJetpackChecklist: isJetpackNotAtomic,
		showThankYou: requestThankYou && isJetpackNotAtomic,
		scheduleId: getConciergeScheduleId( state ),
		isJetpackNotAtomic,
	};
} )( localize( CurrentPlan ) );
