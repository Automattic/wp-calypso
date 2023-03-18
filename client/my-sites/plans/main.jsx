import { isEnabled } from '@automattic/calypso-config';
import {
	getPlan,
	getIntervalTypeForTerm,
	PLAN_FREE,
	PLAN_ECOMMERCE_TRIAL_MONTHLY,
	isFreePlanProduct,
	PLAN_WOOEXPRESS_SMALL,
	PLAN_WOOEXPRESS_SMALL_MONTHLY,
	PLAN_WOOEXPRESS_MEDIUM,
	PLAN_WOOEXPRESS_MEDIUM_MONTHLY,
} from '@automattic/calypso-products';
import { is2023PricingGridActivePage } from '@automattic/calypso-products/src/plans-utilities';
import { WpcomPlansUI } from '@automattic/data-stores';
import { withShoppingCart } from '@automattic/shopping-cart';
import { useDispatch } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { localize, useTranslate } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import Banner from 'calypso/components/banner';
import DocumentHead from 'calypso/components/data/document-head';
import QueryContactDetailsCache from 'calypso/components/data/query-contact-details-cache';
import QueryPlans from 'calypso/components/data/query-plans';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import EmptyContent from 'calypso/components/empty-content';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import withTrackingTool from 'calypso/lib/analytics/with-tracking-tool';
import { getDomainRegistrations } from 'calypso/lib/cart-values/cart-items';
import { PerformanceTrackerStop } from 'calypso/lib/performance-tracking';
import PlansNavigation from 'calypso/my-sites/plans/navigation';
import P2PlansMain from 'calypso/my-sites/plans/p2-plans-main';
import PlansFeaturesMain from 'calypso/my-sites/plans-features-main';
import { isTreatmentPlansReorderTest } from 'calypso/state/marketing/selectors';
import { getPlanSlug } from 'calypso/state/plans/selectors';
import { getByPurchaseId } from 'calypso/state/purchases/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import isEligibleForWpComMonthlyPlan from 'calypso/state/selectors/is-eligible-for-wpcom-monthly-plan';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import CalypsoShoppingCartProvider from '../checkout/calypso-shopping-cart-provider';
import withCartKey from '../checkout/with-cart-key';
import DomainAndPlanPackageNavigation from '../domains/components/domain-and-plan-package/navigation';
import DomainUpsellDialog from './components/domain-upsell-dialog';
import PlansHeader from './components/plans-header';
import ECommerceTrialPlansPage from './ecommerce-trial';
import ModernizedLayout from './modernized-layout';
import WooExpressMediumPlansPage from './wx-medium';

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

class Plans extends Component {
	static propTypes = {
		context: PropTypes.object.isRequired,
		redirectToAddDomainFlow: PropTypes.bool,
		domainAndPlanPackage: PropTypes.string,
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
		this.redirectIfInvalidPlanInterval();

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
		const isWpcomMonthly = intervalType === 'monthly';

		return selectedSite && isWpcomMonthly && ! isSiteEligibleForMonthlyPlan;
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
				<DocumentHead title={ this.props.translate( 'Plans', { textOnly: true } ) } />
				<Main wideLayout>
					<div id="plans" className="plans plans__has-sidebar" />
				</Main>
			</div>
		);
	};

	renderPlansMain() {
		const {
			currentPlan,
			selectedSite,
			isWPForTeamsSite,
			currentPlanIntervalType,
			is2023PricingGridVisible,
		} = this.props;

		if ( ! this.props.plansLoaded || ! currentPlan ) {
			// Maybe we should show a loading indicator here?
			return null;
		}

		if ( isEnabled( 'p2/p2-plus' ) && isWPForTeamsSite ) {
			return (
				<P2PlansMain
					selectedPlan={ this.props.selectedPlan }
					redirectTo={ this.props.redirectTo }
					site={ selectedSite }
					withDiscount={ this.props.withDiscount }
					discountEndDate={ this.props.discountEndDate }
				/>
			);
		}

		const hideFreePlan = ! is2023PricingGridVisible || this.props.isDomainAndPlanPackageFlow;

		const hidePlanTypeSelector =
			this.props.domainAndPlanPackage &&
			( ! this.props.isDomainUpsell ||
				( this.props.isDomainUpsell && currentPlanIntervalType === 'monthly' ) );
		return (
			<PlansFeaturesMain
				redirectToAddDomainFlow={ this.props.redirectToAddDomainFlow }
				hidePlanTypeSelector={ hidePlanTypeSelector }
				hideFreePlan={ hideFreePlan }
				customerType={ this.props.customerType }
				intervalType={ this.props.intervalType }
				selectedFeature={ this.props.selectedFeature }
				selectedPlan={ this.props.selectedPlan }
				redirectTo={ this.props.redirectTo }
				withDiscount={ this.props.withDiscount }
				discountEndDate={ this.props.discountEndDate }
				site={ selectedSite }
				plansWithScroll={ false }
				showTreatmentPlansReorderTest={ this.props.showTreatmentPlansReorderTest }
				hidePlansFeatureComparison={ this.props.isDomainAndPlanPackageFlow }
				is2023PricingGridVisible={ is2023PricingGridVisible }
			/>
		);
	}

	renderEcommerceTrialPage() {
		const { intervalType, selectedSite } = this.props;

		if ( ! selectedSite ) {
			return this.renderPlaceholder();
		}

		// Only accept monthly or yearly for the interval; otherwise let the component provide a default.
		const interval =
			intervalType === 'monthly' || intervalType === 'yearly' ? intervalType : undefined;
		return <ECommerceTrialPlansPage interval={ interval } siteSlug={ selectedSite.slug } />;
	}

	renderWooExpressMediumPage() {
		const { currentPlan, selectedSite } = this.props;
		return <WooExpressMediumPlansPage currentPlan={ currentPlan } selectedSite={ selectedSite } />;
	}

	renderMainContent( { isEcommerceTrial, isWooExpressPlan } ) {
		if ( isEcommerceTrial ) {
			return this.renderEcommerceTrialPage();
		}
		if ( isWooExpressPlan ) {
			return this.renderWooExpressMediumPage();
		}
		return this.renderPlansMain();
	}

	render() {
		const {
			selectedSite,
			translate,
			canAccessPlans,
			currentPlan,
			domainAndPlanPackage,
			is2023PricingGridVisible,
			isDomainAndPlanPackageFlow,
			isJetpackNotAtomic,
			isDomainUpsell,
			isDomainUpsellSuggested,
			isFreePlan,
			currentPlanIntervalType,
		} = this.props;

		if ( ! selectedSite || this.isInvalidPlanInterval() || ! currentPlan ) {
			return this.renderPlaceholder();
		}

		const currentPlanSlug = selectedSite?.plan?.product_slug;
		const isEcommerceTrial = currentPlanSlug === PLAN_ECOMMERCE_TRIAL_MONTHLY;
		const isWooExpressPlan = [
			PLAN_WOOEXPRESS_MEDIUM,
			PLAN_WOOEXPRESS_MEDIUM_MONTHLY,
			PLAN_WOOEXPRESS_SMALL,
			PLAN_WOOEXPRESS_SMALL_MONTHLY,
		].includes( currentPlanSlug );

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

		// Hide for WooExpress plans
		const showPlansNavigation = isEnabled( 'plans/wooexpress-medium' ) ? ! isWooExpressPlan : true;

		return (
			<div>
				{ ! isJetpackNotAtomic && <ModernizedLayout dropShadowOnHeader={ isFreePlan } /> }
				{ selectedSite.ID && <QuerySitePurchases siteId={ selectedSite.ID } /> }
				<DocumentHead title={ translate( 'Plans', { textOnly: true } ) } />
				<PageViewTracker path="/plans/:site" title="Plans" />
				<QueryContactDetailsCache />
				<QueryPlans />
				<TrackComponentView eventName="calypso_plans_view" />
				{ isDomainUpsell && <DomainUpsellDialog domain={ selectedSite.slug } /> }
				{ canAccessPlans && (
					<div>
						{ ! isDomainAndPlanPackageFlow && <PlansHeader /> }
						{ isDomainAndPlanPackageFlow && (
							<>
								<div className="plans__header">
									<DomainAndPlanPackageNavigation goBackLink={ goBackLink } step={ 2 } />

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
						<div id="plans" className="plans plans__has-sidebar">
							{ showPlansNavigation && <PlansNavigation path={ this.props.context.path } /> }
							<Main
								fullWidthLayout={ is2023PricingGridVisible && ! isEcommerceTrial }
								wideLayout={ ! is2023PricingGridVisible || isEcommerceTrial }
							>
								{ ! isDomainAndPlanPackageFlow && domainAndPlanPackage && (
									<DomainAndPlanUpsellNotice />
								) }
								{ this.renderMainContent( { isEcommerceTrial, isWooExpressPlan } ) }
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

const ConnectedPlans = connect( ( state, props ) => {
	const selectedSiteId = getSelectedSiteId( state );

	const currentPlan = getCurrentPlan( state, selectedSiteId );
	const currentPlanIntervalType = getIntervalTypeForTerm(
		getPlan( currentPlan?.productSlug )?.term
	);

	return {
		currentPlan,
		currentPlanIntervalType,
		purchase: currentPlan ? getByPurchaseId( state, currentPlan.id ) : null,
		selectedSite: getSelectedSite( state ),
		canAccessPlans: canCurrentUser( state, getSelectedSiteId( state ), 'manage_options' ),
		isWPForTeamsSite: isSiteWPForTeams( state, selectedSiteId ),
		isSiteEligibleForMonthlyPlan: isEligibleForWpComMonthlyPlan( state, selectedSiteId ),
		showTreatmentPlansReorderTest: isTreatmentPlansReorderTest( state ),
		plansLoaded: Boolean( getPlanSlug( state, getPlan( PLAN_FREE )?.getProductId() || 0 ) ),
		is2023PricingGridVisible:
			props.is2023PricingGridVisible ?? is2023PricingGridActivePage( window ),
		isDomainAndPlanPackageFlow: !! getCurrentQueryArguments( state )?.domainAndPlanPackage,
		isJetpackNotAtomic: isJetpackSite( state, selectedSiteId, { treatAtomicAsJetpackSite: false } ),
		isDomainUpsell:
			!! getCurrentQueryArguments( state )?.domainAndPlanPackage &&
			!! getCurrentQueryArguments( state )?.domain,
		isDomainUpsellSuggested: getCurrentQueryArguments( state )?.domain === 'true',
		isFreePlan: isFreePlanProduct( currentPlan ),
	};
} )( withCartKey( withShoppingCart( localize( withTrackingTool( 'HotJar' )( Plans ) ) ) ) );

export default function PlansWrapper( props ) {
	return (
		<CalypsoShoppingCartProvider>
			<ConnectedPlans { ...props } />
		</CalypsoShoppingCartProvider>
	);
}
