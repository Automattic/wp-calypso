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
	PLAN_ECOMMERCE_TRIAL_MONTHLY,
} from '@automattic/calypso-products';
import { Button, Dialog, Card } from '@automattic/components';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
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
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { isCloseToExpiration } from 'calypso/lib/purchases';
import { getPurchaseByProductSlug } from 'calypso/lib/purchases/utils';
import DomainWarnings from 'calypso/my-sites/domains/components/domain-warnings';
import { isEligibleForProPlan } from 'calypso/my-sites/plans-comparison';
import JetpackChecklist from 'calypso/my-sites/plans/current-plan/jetpack-checklist';
import PlanRenewalMessage from 'calypso/my-sites/plans/jetpack-plans/plan-renewal-message';
import legacyPlanNotice from 'calypso/my-sites/plans/legacy-plan-notice';
import PlansNavigation from 'calypso/my-sites/plans/navigation';
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
import FeatureIncludedCard from './feature-included-card';
import FeatureNotIncludedCard from './feature-not-included-card';
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

	renderMain() {
		const { selectedSiteId, selectedSite, showJetpackChecklist, translate } = this.props;
		const isLoading = this.isLoading();
		const currentPlanSlug = selectedSite.plan.product_slug;
		const planTitle = getPlan( currentPlanSlug ).getTitle();
		const planFeaturesHeader = translate( '{{planName/}} plan features', {
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
		);
	}

	renderEcommerceTrialPage() {
		const { translate } = this.props;

		const whatsIncluded = [
			{
				illustration: '/calypso/images/plans/wpcom/trial-features/priority-support.svg',
				title: translate( 'Priority support' ),
				text: translate( 'Need help? Reach out to us anytime, anywhere.' ),
				showButton: true,
				buttonText: translate( 'Ask a question' ),
			},
			{
				illustration: '/calypso/images/plans/wpcom/trial-features/premium-themes.svg',
				title: translate( 'Premium themes' ),
				text: translate( 'Explore a diverse selection of beautifully designed premium themes.' ),
				showButton: true,
				buttonText: translate( 'Browse premium themes' ),
			},
			{
				illustration: '/calypso/images/plans/wpcom/trial-features/advanced-customization.svg',
				title: translate( 'Advanced customization' ),
				text: translate( "Change your store's appearance in a few clicks!" ),
				showButton: true,
				buttonText: translate( 'Design your store' ),
			},
			{
				illustration: '/calypso/images/plans/wpcom/trial-features/unlimited-products.svg',
				title: translate( 'Unlimited products' ),
				text: translate(
					'List as many products or services as you’d like and offer subscriptions.'
				),
				showButton: true,
				buttonText: translate( 'Add a product' ),
			},
			{
				illustration: '/calypso/images/plans/wpcom/trial-features/jetpack-features.svg',
				title: translate( 'Jetpack features' ),
				text: translate( 'Get auto real-time backups, malware scans, and spam protection.' ),
				showButton: true,
				buttonText: translate( 'Keep your store safe' ),
			},
			{
				illustration: '/calypso/images/plans/wpcom/trial-features/seo-tools.svg',
				title: translate( 'SEO tools' ),
				text: translate(
					'Boost traffic with tools that make your content more findable on search engines.'
				),
				showButton: true,
				buttonText: translate( 'Increase visibility' ),
			},
			{
				illustration: '/calypso/images/plans/wpcom/trial-features/google-analytics.svg',
				title: translate( 'Google Analytics' ),
				text: translate(
					'Understand visitors and traffic patterns more in depht with Google stats.'
				),
				showButton: true,
				buttonText: translate( 'Connect Google Analytics' ),
			},
			{
				illustration: '/calypso/images/plans/wpcom/trial-features/best-in-class-hosting.svg',
				title: translate( 'Best-in-class hosting' ),
				text: translate(
					'Hosting is included with your plan, eliminating additional cost and technical hassle.'
				),
				showButton: false,
			},
		];

		const whatsNotIncluded = [
			{
				illustration: '/calypso/images/plans/wpcom/trial-features/launch.png',
				title: translate( 'Launch your store to the world' ),
				text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis quis magna ac odio ullamcorper efficitur.',
			},
			{
				illustration: '/calypso/images/plans/wpcom/trial-features/themes.png',
				title: translate( 'Get access to more premium themes' ),
				text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis quis magna ac odio ullamcorper efficitur.',
			},
			{
				illustration: '/calypso/images/plans/wpcom/trial-features/money.png',
				title: translate( 'Make money with your store' ),
				text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis quis magna ac odio ullamcorper efficitur.',
			},
			{
				illustration: '/calypso/images/plans/wpcom/trial-features/email.png',
				title: translate( 'Boost your email marketing' ),
				text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis quis magna ac odio ullamcorper efficitur.',
			},
			{
				illustration: '/calypso/images/plans/wpcom/trial-features/promote.png',
				title: translate( 'Promote your products' ),
				text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis quis magna ac odio ullamcorper efficitur.',
			},
			{
				illustration: '/calypso/images/plans/wpcom/trial-features/shipping.png',
				title: translate( 'Integrate top shipping carriers' ),
				text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis quis magna ac odio ullamcorper efficitur.',
			},
		];

		return (
			<>
				<BodySectionCssClass bodyClass={ [ 'is-trial-plan' ] } />

				<Card className="current-plan__trial-card">
					<div className="current-plan__trial-card-content">
						<p className="current-plan__card-title">{ translate( 'You’re in a free trial' ) }</p>
						<p className="current-plan__card-subtitle">
							{ translate(
								'Your free trial will end in 5 days. Sign up to a plan by December 13 unlock new features and keep your store running.'
							) }
						</p>
						<Button primary>{ translate( 'Get Commerce' ) }</Button>
					</div>
					<div className="plans__chart-wrapper">
						<div className="plans__chart" style={ { '--p': '50' } }>
							5
						</div>
						<br />
						<span className="plans__chart-label">{ translate( 'days left in trial' ) }</span>
					</div>
				</Card>

				<h2 className="current-plan__section-title">
					{ translate( 'What’s included in your free trial' ) }
				</h2>
				<div className="current-plan__included-wrapper">
					{ whatsIncluded.map( ( feature ) => (
						<FeatureIncludedCard
							key={ feature.title }
							illustration={ feature.illustration }
							title={ feature.title }
							text={ feature.text }
							showButton={ feature.showButton }
							buttonText={ feature.buttonText }
						></FeatureIncludedCard>
					) ) }
				</div>

				<h2 className="current-plan__section-title">Do you want more?</h2>
				<p className="current-plan__section-subtitle">
					{ translate( 'The free trial doesn’t support the following features.' ) }
					<br />
					{ translate( 'Get the most value out of WooCommerce and pick one of our plans.' ) }
				</p>

				<div className="current-plan__more-wrapper">
					{ whatsNotIncluded.map( ( feature ) => (
						<FeatureNotIncludedCard
							key={ feature.title }
							illustration={ feature.illustration }
							title={ feature.title }
							text={ feature.text }
							showButton={ feature.showButton }
							buttonText={ feature.buttonText }
						></FeatureNotIncludedCard>
					) ) }
				</div>

				<div className="current-plan__cta-wrapper">
					<Button className="current-plan__cta">
						{ translate( 'Enhance your store and get Commerce' ) }
					</Button>
				</div>
			</>
		);
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
			eligibleForProPlan,
		} = this.props;

		const currentPlanSlug = selectedSite.plan.product_slug;
		const isEcommerceTrial = currentPlanSlug === PLAN_ECOMMERCE_TRIAL_MONTHLY;
		const shouldQuerySiteDomains = selectedSiteId && shouldShowDomainWarnings;
		const showDomainWarnings = hasDomainsLoaded && shouldShowDomainWarnings;

		let showExpiryNotice = false;
		let purchase = null;

		if ( JETPACK_LEGACY_PLANS.includes( currentPlanSlug ) ) {
			purchase = getPurchaseByProductSlug( purchases, currentPlanSlug );
			showExpiryNotice = purchase && isCloseToExpiration( purchase );
		}

		// Ensures the Plan tab is shown in case the plan changes after the controller redirect.
		if ( eligibleForProPlan && isFreePlanProduct( selectedSite.plan ) ) {
			page.redirect( `/plans/${ selectedSite.slug }` );

			return null;
		}

		return (
			<Main className="current-plan" wideLayout>
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
					<QuerySiteProducts siteId={ selectedSiteId } />
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

					{ legacyPlanNotice( eligibleForProPlan, selectedSite ) }

					{ isEcommerceTrial ? this.renderEcommerceTrialPage() : this.renderMain() }

					<TrackComponentView eventName="calypso_plans_my_plan_view" />
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
	const eligibleForProPlan = isEligibleForProPlan( state, selectedSiteId );

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
		eligibleForProPlan,
	};
} )( localize( CurrentPlan ) );
