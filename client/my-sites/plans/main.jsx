import { isEnabled } from '@automattic/calypso-config';
import {
	FEATURE_LEGACY_STORAGE_200GB,
	getIntervalTypeForTerm,
	getPlan,
	is100Year,
	isFreePlanProduct,
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_TRIAL_MONTHLY,
	PLAN_HOSTING_TRIAL_MONTHLY,
	PLAN_MIGRATION_TRIAL_MONTHLY,
	PLAN_WOOEXPRESS_MEDIUM,
	PLAN_WOOEXPRESS_MEDIUM_MONTHLY,
	PLAN_WOOEXPRESS_SMALL,
	PLAN_WOOEXPRESS_SMALL_MONTHLY,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { WpcomPlansUI, Plans } from '@automattic/data-stores';
import { withShoppingCart } from '@automattic/shopping-cart';
import { useDispatch } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { localize, useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import Banner from 'calypso/components/banner';
import DocumentHead from 'calypso/components/data/document-head';
import QueryProducts from 'calypso/components/data/query-products-list';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import EmptyContent from 'calypso/components/empty-content';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getDomainRegistrations } from 'calypso/lib/cart-values/cart-items';
import { PerformanceTrackerStop } from 'calypso/lib/performance-tracking';
import { isPlansPageUntangled } from 'calypso/lib/plans/untangling-plans-experiment';
import { isPartnerPurchase } from 'calypso/lib/purchases';
import PlansNavigation from 'calypso/my-sites/plans/navigation';
import P2PlansMain from 'calypso/my-sites/plans/p2-plans-main';
import PlansFeaturesMain from 'calypso/my-sites/plans-features-main';
import { FeatureBreadcrumb } from 'calypso/sites/hooks/breadcrumbs/use-set-feature-breadcrumb';
import CurrentPlanPanel from 'calypso/sites/plan/components/current-plan-panel';
import { useSelector } from 'calypso/state';
import { getByPurchaseId } from 'calypso/state/purchases/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import getCurrentPlanTerm from 'calypso/state/selectors/get-current-plan-term';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getDomainFromHomeUpsellInQuery from 'calypso/state/selectors/get-domain-from-home-upsell-in-query';
import isEligibleForWpComMonthlyPlan from 'calypso/state/selectors/is-eligible-for-wpcom-monthly-plan';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { useSiteGlobalStylesOnPersonal } from 'calypso/state/sites/hooks/use-site-global-styles-on-personal';
import { fetchSitePlans } from 'calypso/state/sites/plans/actions';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import CalypsoShoppingCartProvider from '../checkout/calypso-shopping-cart-provider';
import withCartKey from '../checkout/with-cart-key';
import DomainAndPlanPackageNavigation from '../domains/components/domain-and-plan-package/navigation';
import DomainUpsellDialog from './components/domain-upsell-dialog';
import PlansHeader from './components/plans-header';
import ECommerceTrialPlansPage from './ecommerce-trial';
import ModernizedLayout from './modernized-layout';
import BusinessTrialPlansPage from './trials/business-trial-plans-page';
import WooExpressPlansPage from './woo-express-plans-page';

import './style.scss';

function DomainAndPlanUpsellNotice() {
	const translate = useTranslate();
	const noticeTitle = translate( 'Almost done' );
	const noticeDescription = translate( 'Upgrade today to claim your free domain name!' );
	return (
		<Banner
			title={ noticeTitle }
			description={ noticeDescription }
			icon="star"
			showIcon
			disableHref
		/>
	);
}
function DescriptionMessage( { isDomainUpsell, isFreePlan, yourDomainName, siteSlug } ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	if ( ! isDomainUpsell ) {
		return (
			<>
				<p>
					{ translate(
						'With your annual plan, you’ll get %(domainName)s {{strong}}free for the first year{{/strong}}.',
						{
							args: {
								domainName: yourDomainName,
							},
							components: {
								strong: <strong />,
							},
						}
					) }
				</p>
				<p>
					{ translate(
						'You’ll also unlock advanced features that make it easy to build and grow your site.'
					) }
				</p>
			</>
		);
	}

	const skipPlan = () => {
		recordTracksEvent( 'calypso_plans_page_domain_upsell_skip_click' );
		// show Warning only on free plans.
		isFreePlan
			? dispatch( WpcomPlansUI.store ).setShowDomainUpsellDialog( true )
			: page( `/checkout/${ siteSlug }` );
	};

	const subtitle = isFreePlan
		? translate( 'See and compare the features available on each WordPress.com plan' )
		: translate( 'All of our annual plans include a free domain name for one year.' );

	const subtitle2 = isFreePlan
		? ''
		: translate(
				'Upgrade to a yearly plan and claim {{strong}}%(domainName)s for free{{/strong}}.',
				{
					args: {
						domainName: yourDomainName,
					},
					components: {
						strong: <strong />,
						br: <br />,
					},
				}
		  );

	const skipText = isFreePlan
		? translate( 'Or continue with the free plan.' )
		: translate( 'Or continue with your monthly plan.' );

	return (
		<>
			<p>{ subtitle }</p>
			{ subtitle2 && <p>{ subtitle2 }</p> }
			<p>
				<button onClick={ skipPlan }>{ skipText }</button>
			</p>
		</>
	);
}

class PlansComponent extends Component {
	static propTypes = {
		context: PropTypes.object.isRequired,
		coupon: PropTypes.string,
		redirectToAddDomainFlow: PropTypes.bool,
		domainAndPlanPackage: PropTypes.bool,
		intervalType: PropTypes.string,
		customerType: PropTypes.string,
		selectedFeature: PropTypes.string,
		redirectTo: PropTypes.string,
		selectedSite: PropTypes.object,
		isDomainAndPlanPackageFlow: PropTypes.bool,
		isDomainUpsell: PropTypes.bool,
		isDomainUpsellSuggested: PropTypes.bool,
	};

	static defaultProps = {
		intervalType: 'yearly',
	};

	componentDidMount() {
		const { currentPlan, selectedSite } = this.props;
		this.redirectIfInvalidPlanInterval();
		if ( ! currentPlan && selectedSite ) {
			this.props.fetchSitePlans( selectedSite.ID );
		}

		if ( this.props.isDomainAndPlanPackageFlow ) {
			document.body.classList.add( 'is-domain-plan-package-flow' );
		}

		// Scroll to the top
		if ( typeof window !== 'undefined' ) {
			window.scrollTo( 0, 0 );
		}
	}

	componentWillUnmount() {
		if ( document.body.classList.contains( 'is-domain-plan-package-flow' ) ) {
			document.body.classList.remove( 'is-domain-plan-package-flow' );
		}
	}

	componentDidUpdate() {
		this.redirectIfInvalidPlanInterval();
	}

	isInvalidPlanInterval() {
		const { isSiteEligibleForMonthlyPlan, intervalType, selectedSite } = this.props;

		if ( 'monthly' === intervalType && selectedSite ) {
			// This is the reason isInvalidPlanInterval even exists and the redirection isn't handled at controller level
			return ! isSiteEligibleForMonthlyPlan;
		}
	}

	redirectIfInvalidPlanInterval() {
		const { selectedSite } = this.props;

		if ( this.isInvalidPlanInterval() ) {
			page.redirect( '/plans/yearly/' + selectedSite.slug );
		}
	}

	onSelectPlan = ( item ) => {
		const {
			selectedSite,
			context: {
				query: { discount },
			},
		} = this.props;
		const checkoutPath = `/checkout/${ selectedSite.slug }/${ item.product_slug }/`;

		page(
			discount
				? addQueryArgs( checkoutPath, {
						coupon: discount,
				  } )
				: checkoutPath
		);
	};

	renderPlaceholder = () => {
		return (
			<div>
				<Main wideLayout>
					<div id="plans" className="plans plans__has-sidebar" />
				</Main>
			</div>
		);
	};

	renderPlansMain() {
		const { selectedSite, isUntangled, isWPForTeamsSite, currentPlanIntervalType } = this.props;

		if ( isEnabled( 'p2/p2-plus' ) && isWPForTeamsSite ) {
			return (
				<P2PlansMain
					// None of these props appear to be used by the P2PlansMain component.
					// We should consider removing them.
					selectedPlan={ this.props.selectedPlan }
					redirectTo={ this.props.redirectTo }
					site={ selectedSite }
					coupon={ this.props.coupon }
					discountEndDate={ this.props.discountEndDate }
				/>
			);
		}

		const hideFreePlan = this.props.isDomainAndPlanPackageFlow;
		// The Jetpack mobile app wants to display a specific selection of plans
		const plansIntent = this.props.jetpackAppPlans ? 'plans-jetpack-app' : null;
		const hidePlanTypeSelector =
			this.props.domainAndPlanPackage &&
			( ! this.props.isDomainUpsell ||
				( this.props.isDomainUpsell && currentPlanIntervalType === 'monthly' ) );

		return (
			<PlansFeaturesMain
				isInSiteDashboard={ isUntangled }
				redirectToAddDomainFlow={ this.props.redirectToAddDomainFlow }
				hidePlanTypeSelector={ hidePlanTypeSelector }
				hideFreePlan={ hideFreePlan }
				customerType={ this.props.customerType }
				intervalType={ this.props.intervalType }
				selectedFeature={ this.props.selectedFeature }
				selectedPlan={ this.props.selectedPlan }
				redirectTo={ this.props.redirectTo }
				coupon={ this.props.coupon }
				discountEndDate={ this.props.discountEndDate }
				siteId={ selectedSite?.ID }
				plansWithScroll={ false }
				hidePlansFeatureComparison={ this.props.isDomainAndPlanPackageFlow }
				showLegacyStorageFeature={ this.props.siteHasLegacyStorage }
				intent={ plansIntent }
				isSpotlightOnCurrentPlan={ ! isUntangled && ! this.props.isDomainAndPlanPackageFlow }
				showPlanTypeSelectorDropdown={ isEnabled( 'onboarding/interval-dropdown' ) }
			/>
		);
	}

	getIntervalForWooExpressPlans() {
		const { intervalType } = this.props;

		// Only accept monthly or yearly for the interval; otherwise let the component provide a default.
		const interval =
			intervalType === 'monthly' || intervalType === 'yearly' ? intervalType : undefined;

		return interval;
	}

	renderEcommerceTrialPage() {
		const { selectedSite, purchase } = this.props;

		if ( ! selectedSite || ! purchase ) {
			return this.renderPlaceholder();
		}

		const interval = this.getIntervalForWooExpressPlans();

		return (
			<ECommerceTrialPlansPage
				isWooExpressTrial={ !! purchase?.isWooExpressTrial }
				interval={ interval }
				site={ selectedSite }
			/>
		);
	}

	renderBusinessTrialPage() {
		const { selectedSite } = this.props;

		if ( ! selectedSite ) {
			return this.renderPlaceholder();
		}

		return <BusinessTrialPlansPage selectedSite={ selectedSite } />;
	}

	renderWooExpressPlansPage() {
		const { currentPlan, selectedSite, isSiteEligibleForMonthlyPlan } = this.props;

		if ( ! selectedSite ) {
			return this.renderPlaceholder();
		}

		const interval = this.getIntervalForWooExpressPlans();

		return (
			<WooExpressPlansPage
				currentPlan={ currentPlan }
				interval={ interval }
				selectedSite={ selectedSite }
				showIntervalToggle={ isSiteEligibleForMonthlyPlan }
			/>
		);
	}

	renderMainContent( {
		isEcommerceTrial,
		isBusinessTrial,
		isWooExpressPlan,
		isA4APlan,
		is100YearPlan,
	} ) {
		if ( isEcommerceTrial ) {
			return this.renderEcommerceTrialPage();
		}
		if ( isWooExpressPlan ) {
			return this.renderWooExpressPlansPage();
		}
		if ( isBusinessTrial ) {
			return this.renderBusinessTrialPage();
		}
		if ( isA4APlan || is100YearPlan ) {
			return null;
		}

		return this.renderPlansMain();
	}

	render() {
		const { isUntangled, selectedSite, translate } = this.props;
		return (
			<>
				<DocumentHead title={ translate( 'Plans', { textOnly: true } ) } />
				{ isUntangled && (
					<FeatureBreadcrumb siteId={ selectedSite.ID } title={ translate( 'Plan' ) } />
				) }
				{ this.renderContent() }
			</>
		);
	}

	renderContent() {
		const {
			selectedSite,
			translate,
			canAccessPlans,
			isUntangled,
			currentPlan,
			domainAndPlanPackage,
			isDomainAndPlanPackageFlow,
			isJetpackNotAtomic,
			isDomainUpsell,
			isDomainUpsellSuggested,
			isFreePlan,
			currentPlanIntervalType,
			domainFromHomeUpsellFlow,
			jetpackAppPlans,
			purchase,
		} = this.props;

		if ( ! selectedSite || this.isInvalidPlanInterval() || ! currentPlan ) {
			return this.renderPlaceholder();
		}

		const currentPlanSlug = selectedSite?.plan?.product_slug;
		const isEcommerceTrial = currentPlanSlug === PLAN_ECOMMERCE_TRIAL_MONTHLY;
		const isBusinessTrial =
			currentPlanSlug === PLAN_MIGRATION_TRIAL_MONTHLY ||
			currentPlanSlug === PLAN_HOSTING_TRIAL_MONTHLY;
		const isWooExpressPlan = [
			PLAN_WOOEXPRESS_MEDIUM,
			PLAN_WOOEXPRESS_MEDIUM_MONTHLY,
			PLAN_WOOEXPRESS_SMALL,
			PLAN_WOOEXPRESS_SMALL_MONTHLY,
		].includes( currentPlanSlug );
		const wooExpressSubHeaderText = translate(
			"Discover what's available in your Woo Express plan."
		);
		const entrepreneurTrialSubHeaderText =
			// translators: %(planName)s is a plan name. E.g. Commerce plan.
			translate( "Discover what's available in your %(planName)s plan.", {
				args: {
					planName: getPlan( PLAN_ECOMMERCE )?.getTitle() ?? '',
				},
			} );

		const isWooExpressTrial = purchase?.isWooExpressTrial;
		const isA4APlan = purchase && isPartnerPurchase( purchase );
		const is100YearPlan = purchase && is100Year( purchase );

		// Use the Woo Express subheader text if the current plan has the Performance or trial plans or fallback to the default subheader text.
		let subHeaderText = null;
		if ( isWooExpressPlan || isEcommerceTrial ) {
			subHeaderText = isWooExpressTrial ? wooExpressSubHeaderText : entrepreneurTrialSubHeaderText;
		}

		const allDomains = isDomainAndPlanPackageFlow ? getDomainRegistrations( this.props.cart ) : [];
		const yourDomainName = allDomains.length
			? allDomains.slice( -1 )[ 0 ]?.meta
			: translate( 'your domain name' );
		const goBackLink =
			isDomainUpsell && isDomainUpsellSuggested
				? addQueryArgs( `/home/${ selectedSite.slug }` )
				: addQueryArgs( `/domains/add/${ selectedSite.slug }`, {
						domainAndPlanPackage: true,
				  } );
		// eslint-disable-next-line no-nested-ternary

		const headline =
			currentPlanIntervalType === 'monthly'
				? translate( 'Get your domain’s first year for free' )
				: translate( 'Choose the perfect plan' );

		// Hide for WooExpress plans and Entrepreneur trials that are not WooExpress trials
		const isEntrepreneurTrial = isEcommerceTrial && ! purchase?.isWooExpressTrial;
		const showPlansNavigation = ! isUntangled && ! ( isWooExpressPlan || isEntrepreneurTrial );

		return (
			<div>
				{ ! isUntangled && ! isJetpackNotAtomic && <ModernizedLayout /> }
				{ selectedSite.ID && <QuerySitePurchases siteId={ selectedSite.ID } /> }
				<PageViewTracker path="/plans/:site" title="Plans" />
				{ /** QueryProducts added to ensure currency-code state gets populated for usages of getCurrentUserCurrencyCode */ }
				<QueryProducts />
				<TrackComponentView
					eventName="calypso_plans_view"
					eventProperties={ {
						current_plan_slug: currentPlanSlug || null,
						is_site_on_paid_plan: !! ( currentPlanSlug && ! isFreePlan ),
					} }
				/>
				{ ( isDomainUpsell || domainFromHomeUpsellFlow ) && (
					<DomainUpsellDialog domain={ selectedSite.slug } />
				) }
				{ canAccessPlans && (
					<div>
						{ isUntangled && <CurrentPlanPanel /> }
						{ ! isUntangled && ! isDomainAndPlanPackageFlow && (
							<PlansHeader
								domainFromHomeUpsellFlow={ domainFromHomeUpsellFlow }
								subHeaderText={ subHeaderText }
							/>
						) }
						{ isDomainAndPlanPackageFlow && (
							<>
								<div className="plans__header">
									{ ! jetpackAppPlans && (
										<DomainAndPlanPackageNavigation goBackLink={ goBackLink } step={ 2 } />
									) }

									<FormattedHeader brandFont headerText={ headline } align="center" />

									<DescriptionMessage
										isFreePlan={ isFreePlan }
										yourDomainName={ yourDomainName }
										siteSlug={ selectedSite.slug }
										isDomainUpsell={ isDomainUpsell }
									/>
								</div>
							</>
						) }
						<div id={ isUntangled ? 'site-plans' : 'plans' } className="plans plans__has-sidebar">
							{ showPlansNavigation && <PlansNavigation path={ this.props.context.path } /> }
							<Main fullWidthLayout={ ! isWooExpressTrial } wideLayout={ isWooExpressTrial }>
								{ ! isDomainAndPlanPackageFlow && domainAndPlanPackage && (
									<DomainAndPlanUpsellNotice />
								) }
								{ this.renderMainContent( {
									isEcommerceTrial,
									isBusinessTrial,
									isWooExpressPlan,
									isA4APlan,
									is100YearPlan,
								} ) }
								<PerformanceTrackerStop />
							</Main>
						</div>
					</div>
				) }
				{ ! canAccessPlans && (
					<EmptyContent
						illustration="/calypso/images/illustrations/illustration-404.svg"
						title={ translate( 'You are not authorized to view this page' ) }
					/>
				) }
			</div>
		);
	}
}

const ConnectedPlans = connect(
	( state, props ) => {
		const { currentPlan, selectedSiteId } = props;
		const currentPlanIntervalType = getIntervalTypeForTerm(
			getPlan( currentPlan?.productSlug )?.term
		);

		return {
			currentPlan,
			currentPlanIntervalType,
			purchase: currentPlan ? getByPurchaseId( state, currentPlan.purchaseId ) : null,
			selectedSite: getSelectedSite( state ),
			canAccessPlans: canCurrentUser( state, getSelectedSiteId( state ), 'manage_options' ),
			isUntangled: isPlansPageUntangled( state ),
			isWPForTeamsSite: isSiteWPForTeams( state, selectedSiteId ),
			isSiteEligibleForMonthlyPlan: isEligibleForWpComMonthlyPlan( state, selectedSiteId ),
			isDomainAndPlanPackageFlow: !! getCurrentQueryArguments( state )?.domainAndPlanPackage,
			isJetpackNotAtomic: isJetpackSite( state, selectedSiteId, {
				treatAtomicAsJetpackSite: false,
			} ),
			isDomainUpsell:
				!! getCurrentQueryArguments( state )?.domainAndPlanPackage &&
				!! getCurrentQueryArguments( state )?.domain,
			isDomainUpsellSuggested: getCurrentQueryArguments( state )?.domain === 'true',
			isFreePlan: isFreePlanProduct( currentPlan ),
			domainFromHomeUpsellFlow: getDomainFromHomeUpsellInQuery( state ),
			siteHasLegacyStorage: siteHasFeature( state, selectedSiteId, FEATURE_LEGACY_STORAGE_200GB ),
			locale: getCurrentLocaleSlug( state ),
		};
	},
	( dispatch ) => ( {
		fetchSitePlans: ( siteId ) => dispatch( fetchSitePlans( siteId ) ),
	} )
)( withCartKey( withShoppingCart( localize( PlansComponent ) ) ) );

export default function PlansWrapper( props ) {
	const { intervalType: intervalTypeFromProps } = props;
	const selectedSiteId = useSelector( getSelectedSiteId );
	const currentPlan = Plans.useCurrentPlan( { siteId: selectedSiteId } );

	// Initialize Global Styles.
	useSiteGlobalStylesOnPersonal();

	/**
	 * For WP.com plans page, if intervalType is not explicitly specified in the URL,
	 * we want to show plans of the same term as plan that is currently active
	 * We want to show the highest term between the current plan and the longer plan term default experiment
	 */
	const intervalTypeForCurrentPlanTerm = useSelector( ( state ) =>
		getIntervalTypeForTerm( getCurrentPlanTerm( state, selectedSiteId ) )
	);

	return (
		<CalypsoShoppingCartProvider>
			<ConnectedPlans
				{ ...props }
				currentPlan={ currentPlan }
				selectedSiteId={ selectedSiteId }
				intervalType={ intervalTypeFromProps ?? intervalTypeForCurrentPlanTerm }
			/>
		</CalypsoShoppingCartProvider>
	);
}
