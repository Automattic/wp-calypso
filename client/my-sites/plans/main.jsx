import { isEnabled } from '@automattic/calypso-config';
import { getPlan, getIntervalTypeForTerm, PLAN_FREE } from '@automattic/calypso-products';
import styled from '@emotion/styled';
import { addQueryArgs } from '@wordpress/url';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryContactDetailsCache from 'calypso/components/data/query-contact-details-cache';
import QueryPlans from 'calypso/components/data/query-plans';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import EmptyContent from 'calypso/components/empty-content';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import withTrackingTool from 'calypso/lib/analytics/with-tracking-tool';
import { useExperiment } from 'calypso/lib/explat';
import { PerformanceTrackerStop } from 'calypso/lib/performance-tracking';
import { isEligibleForProPlan } from 'calypso/my-sites/plans-comparison';
import PlansFeaturesMain from 'calypso/my-sites/plans-features-main';
import legacyPlanNotice from 'calypso/my-sites/plans/legacy-plan-notice';
import PlansNavigation from 'calypso/my-sites/plans/navigation';
import P2PlansMain from 'calypso/my-sites/plans/p2-plans-main';
import { isTreatmentPlansReorderTest } from 'calypso/state/marketing/selectors';
import { getPlanSlug } from 'calypso/state/plans/selectors';
import { getByPurchaseId } from 'calypso/state/purchases/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isEligibleForWpComMonthlyPlan from 'calypso/state/selectors/is-eligible-for-wpcom-monthly-plan';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';

const ProfessionalEmailPromotionPlaceholder = styled.div`
	animation: loading-fade 1.6s ease-in-out infinite;
	background-color: var( --color-neutral-10 );
	color: transparent;
	min-height: 250px;
`;

const ProfessionalEmailPromotionWrapper = ( props ) => {
	const [ isLoadingExperimentAssignment, experimentAssignment ] = useExperiment(
		'calypso_promote_professional_email_as_a_plan_feature_2022_02'
	);

	if ( isLoadingExperimentAssignment ) {
		return <ProfessionalEmailPromotionPlaceholder />;
	}

	const isProfessionalEmailPromotionAvailable = 'treatment' === experimentAssignment?.variationName;

	return (
		<PlansFeaturesMain
			redirectToAddDomainFlow={ props.redirectToAddDomainFlow }
			hideFreePlan={ props.hideFreePlan }
			customerType={ props.customerType }
			intervalType={ props.intervalType }
			selectedFeature={ props.selectedFeature }
			selectedPlan={ props.selectedPlan }
			redirectTo={ props.redirectTo }
			withDiscount={ props.withDiscount }
			discountEndDate={ props.discountEndDate }
			site={ props.site }
			plansWithScroll={ props.plansWithScroll }
			showTreatmentPlansReorderTest={ props.showTreatmentPlansReorderTest }
			isProfessionalEmailPromotionAvailable={ isProfessionalEmailPromotionAvailable }
		/>
	);
};

class Plans extends Component {
	static propTypes = {
		context: PropTypes.object.isRequired,
		redirectToAddDomainFlow: PropTypes.bool,
		intervalType: PropTypes.string,
		customerType: PropTypes.string,
		selectedFeature: PropTypes.string,
		redirectTo: PropTypes.string,
		selectedSite: PropTypes.object,
	};

	static defaultProps = {
		intervalType: 'yearly',
	};

	componentDidMount() {
		this.redirectIfInvalidPlanInterval();

		// Scroll to the top
		if ( typeof window !== 'undefined' ) {
			window.scrollTo( 0, 0 );
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
		const { currentPlan, selectedSite, isWPForTeamsSite } = this.props;

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

		return (
			<ProfessionalEmailPromotionWrapper
				redirectToAddDomainFlow={ this.props.redirectToAddDomainFlow }
				hideFreePlan={ true }
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
			/>
		);
	}

	render() {
		const { selectedSite, translate, canAccessPlans, currentPlan, eligibleForProPlan } = this.props;

		if ( ! selectedSite || this.isInvalidPlanInterval() || ! currentPlan ) {
			return this.renderPlaceholder();
		}
		const description = translate(
			'See and compare the features available on each WordPress.com plan.'
		);
		return (
			<div>
				{ selectedSite.ID && <QuerySitePurchases siteId={ selectedSite.ID } /> }
				<DocumentHead title={ translate( 'Plans', { textOnly: true } ) } />
				<PageViewTracker path="/plans/:site" title="Plans" />
				<QueryContactDetailsCache />
				<QueryPlans />
				<TrackComponentView eventName="calypso_plans_view" />
				<Main wideLayout>
					{ ! canAccessPlans && (
						<EmptyContent
							illustration="/calypso/images/illustrations/illustration-404.svg"
							title={ translate( 'You are not authorized to view this page' ) }
						/>
					) }
					{ canAccessPlans && (
						<>
							<FormattedHeader
								brandFont
								headerText={ translate( 'Plans' ) }
								subHeaderText={ description }
								align="left"
							/>
							<div id="plans" className="plans plans__has-sidebar">
								<PlansNavigation path={ this.props.context.path } />
								{ legacyPlanNotice( eligibleForProPlan, selectedSite ) }
								{ this.renderPlansMain() }
								<PerformanceTrackerStop />
							</div>
						</>
					) }
				</Main>
			</div>
		);
	}
}

export default connect( ( state ) => {
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
		eligibleForProPlan: isEligibleForProPlan( state, selectedSiteId ),
	};
} )( localize( withTrackingTool( 'HotJar' )( Plans ) ) );
