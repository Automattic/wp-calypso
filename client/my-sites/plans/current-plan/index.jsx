import {
	getPlan,
	JETPACK_LEGACY_PLANS,
	PLAN_JETPACK_COMPLETE,
	PLAN_JETPACK_COMPLETE_MONTHLY,
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
	isFlexiblePlanProduct,
	isManaged,
} from '@automattic/calypso-products';
import { Dialog } from '@automattic/components';
import { Global } from '@emotion/react';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import DocumentHead from 'calypso/components/data/document-head';
import QueryConciergeInitial from 'calypso/components/data/query-concierge-initial';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import QuerySites from 'calypso/components/data/query-sites';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { isCloseToExpiration } from 'calypso/lib/purchases';
import { getPurchaseByProductSlug } from 'calypso/lib/purchases/utils';
import DomainWarnings from 'calypso/my-sites/domains/components/domain-warnings';
import { globalOverrides, isEligibleForManagedPlan } from 'calypso/my-sites/plans-comparison';
import JetpackChecklist from 'calypso/my-sites/plans/current-plan/jetpack-checklist';
import PlanRenewalMessage from 'calypso/my-sites/plans/jetpack-plans/plan-renewal-message';
import PlansNavigation from 'calypso/my-sites/plans/navigation';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import { getSitePurchases } from 'calypso/state/purchases/selectors';
import getConciergeScheduleId from 'calypso/state/selectors/get-concierge-schedule-id';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getCurrentPlan, isRequestingSitePlans } from 'calypso/state/sites/plans/selectors';
import { getJetpackSearchCustomizeUrl, isJetpackSite } from 'calypso/state/sites/selectors';
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

import './style.scss';

class CurrentPlan extends Component {
	state = {
		hideThankYouModal: false,
	};

	static propTypes = {
		selectedSiteId: PropTypes.number,
		selectedSite: PropTypes.object,
		isRequestingSitePlans: PropTypes.bool,
		path: PropTypes.string.isRequired,
		domains: PropTypes.array,
		purchases: PropTypes.array,
		currentPlan: PropTypes.object,
		plan: PropTypes.string,
		product: PropTypes.string,
		requestThankYou: PropTypes.bool,
		shouldShowDomainWarnings: PropTypes.bool,
		hasDomainsLoaded: PropTypes.bool,
		showJetpackChecklist: PropTypes.bool,
		showThankYou: PropTypes.bool,

		// From localize() HoC
		translate: PropTypes.func.isRequired,
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

	renderThankYou() {
		const { currentPlan, jetpackSearchCustomizeUrl, product } = this.props;

		if ( JETPACK_BACKUP_PRODUCTS.includes( product ) ) {
			return <BackupProductThankYou />;
		}

		if ( JETPACK_SCAN_PRODUCTS.includes( product ) ) {
			return <ScanProductThankYou />;
		}

		if ( JETPACK_ANTI_SPAM_PRODUCTS.includes( product ) ) {
			return <AntiSpamProductThankYou />;
		}

		if ( JETPACK_VIDEOPRESS_PRODUCTS.includes( product ) ) {
			return <VideoPressProductThankYou />;
		}

		if ( JETPACK_SEARCH_PRODUCTS.includes( product ) ) {
			return <SearchProductThankYou { ...{ jetpackSearchCustomizeUrl } } />;
		}

		if (
			[ PLAN_JETPACK_SECURITY_DAILY, PLAN_JETPACK_SECURITY_DAILY_MONTHLY ].includes( product )
		) {
			return <JetpackSecurityDailyThankYou />;
		}

		if (
			[ PLAN_JETPACK_SECURITY_REALTIME, PLAN_JETPACK_SECURITY_REALTIME_MONTHLY ].includes( product )
		) {
			return <JetpackSecurityRealtimeThankYou />;
		}

		if ( [ PLAN_JETPACK_COMPLETE, PLAN_JETPACK_COMPLETE_MONTHLY ].includes( product ) ) {
			return <JetpackCompleteThankYou />;
		}

		if ( ! currentPlan || isFreePlanProduct( currentPlan ) || isFreeJetpackPlan( currentPlan ) ) {
			return <FreePlanThankYou />;
		}

		return <PaidPlanThankYou />;
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
			showJetpackChecklist,
			showThankYou,
			translate,
			eligibleForManagedPlan,
		} = this.props;

		const currentPlanSlug = selectedSite.plan.product_slug;
		const isLoading = this.isLoading();
		const planTitle = getPlan( currentPlanSlug ).getTitle();

		const planFeaturesHeader = translate( '{{planName/}} plan features', {
			components: { planName: <>{ planTitle }</> },
		} );

		const shouldQuerySiteDomains = selectedSiteId && shouldShowDomainWarnings;
		const showDomainWarnings = hasDomainsLoaded && shouldShowDomainWarnings;

		let showExpiryNotice = false;
		let purchase = null;
		let showLegacyPlanNotice = false;

		if ( JETPACK_LEGACY_PLANS.includes( currentPlanSlug ) ) {
			purchase = getPurchaseByProductSlug( purchases, currentPlanSlug );
			showExpiryNotice = purchase && isCloseToExpiration( purchase );
		}

		if (
			eligibleForManagedPlan &&
			! isFlexiblePlanProduct( selectedSite.plan ) &&
			! isManaged( selectedSite.plan )
		) {
			showLegacyPlanNotice = true;
		}

		return (
			<Main className="current-plan" wideLayout>
				<SidebarNavigation />
				{ eligibleForManagedPlan && <Global styles={ globalOverrides } /> }
				<DocumentHead title={ translate( 'My Plan' ) } />
				<FormattedHeader
					brandFont
					className="current-plan__page-heading"
					headerText={ translate( 'Plans' ) }
					subHeaderText={ translate(
						'Learn about the features included in your WordPress.com plan.'
					) }
					align="left"
				/>
				<div className="current-plan__content">
					{ selectedSiteId && (
						// key={ selectedSiteId } ensures data is refetched for changing selectedSiteId
						<QueryConciergeInitial key={ selectedSiteId } siteId={ selectedSiteId } />
					) }
					<QuerySites siteId={ selectedSiteId } />
					<QuerySitePlans siteId={ selectedSiteId } />
					<QuerySitePurchases siteId={ selectedSiteId } />
					{ shouldQuerySiteDomains && <QuerySiteDomains siteId={ selectedSiteId } /> }

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

					{ showDomainWarnings && (
						<DomainWarnings
							domains={ domains }
							position="current-plan"
							selectedSite={ selectedSite }
							allowedRules={ [
								'newDomainsWithPrimary',
								'newDomains',
								'unverifiedDomainsCanManage',
								'pendingGSuiteTosAcceptanceDomains',
								'unverifiedDomainsCannotManage',
								'wrongNSMappedDomains',
								'newTransfersWrongNS',
							] }
						/>
					) }

					{ showExpiryNotice && (
						<Notice status="is-info" text={ <PlanRenewalMessage /> } showDismiss={ false }>
							<NoticeAction href={ `/plans/${ selectedSite.slug || '' }` }>
								{ translate( 'View plans' ) }
							</NoticeAction>
						</Notice>
					) }

					{ showLegacyPlanNotice && (
						<Notice
							status="is-info"
							text={
								'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer ut felis et orci fringilla pretium. Consectura elit et orci fel.'
							}
							icon="info-outline"
							showDismiss={ false }
						></Notice>
					) }

					<PurchasesListing />

					{ showJetpackChecklist && (
						<Fragment>
							<QueryJetpackPlugins siteIds={ [ selectedSiteId ] } />
							<JetpackChecklist />
						</Fragment>
					) }

					{ ! eligibleForManagedPlan && (
						<>
							<div
								className={ classNames( 'current-plan__header-text current-plan__text', {
									'is-placeholder': { isLoading },
								} ) }
							>
								<h1 className="current-plan__header-heading">{ planFeaturesHeader }</h1>
							</div>
							<AsyncLoad
								require="calypso/blocks/product-purchase-features-list"
								placeholder={ null }
								plan={ currentPlanSlug }
								isPlaceholder={ isLoading }
							/>
						</>
					) }
					<TrackComponentView eventName={ 'calypso_plans_my_plan_view' } />
				</div>
			</Main>
		);
	}
}

export default connect( ( state, { requestThankYou } ) => {
	const selectedSite = getSelectedSite( state );
	const selectedSiteId = getSelectedSiteId( state );
	const domains = getDomainsBySiteId( state, selectedSiteId );
	const purchases = getSitePurchases( state, selectedSiteId );

	const isJetpack = isJetpackSite( state, selectedSiteId );
	const isAutomatedTransfer = isSiteAutomatedTransfer( state, selectedSiteId );

	const isJetpackNotAtomic = false === isAutomatedTransfer && isJetpack;

	const currentPlan = getCurrentPlan( state, selectedSiteId );
	const eligibleForManagedPlan = isEligibleForManagedPlan( state, selectedSiteId );

	return {
		currentPlan,
		domains,
		purchases,
		hasDomainsLoaded: !! domains,
		isRequestingSitePlans: isRequestingSitePlans( state, selectedSiteId ),
		jetpackSearchCustomizeUrl: getJetpackSearchCustomizeUrl( state, selectedSiteId ),
		selectedSite,
		selectedSiteId,
		shouldShowDomainWarnings: ! isJetpack || isAutomatedTransfer,
		showJetpackChecklist: isJetpackNotAtomic,
		showThankYou: requestThankYou && isJetpackNotAtomic,
		scheduleId: getConciergeScheduleId( state ),
		eligibleForManagedPlan,
	};
} )( localize( CurrentPlan ) );
