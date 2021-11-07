import { isEnabled } from '@automattic/calypso-config';
import { getPlan, getIntervalTypeForTerm } from '@automattic/calypso-products';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryContactDetailsCache from 'calypso/components/data/query-contact-details-cache';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import EmptyContent from 'calypso/components/empty-content';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import withTrackingTool from 'calypso/lib/analytics/with-tracking-tool';
import { PerformanceTrackerStop } from 'calypso/lib/performance-tracking';
import PlansFeaturesMain from 'calypso/my-sites/plans-features-main';
import PlansNavigation from 'calypso/my-sites/plans/navigation';
import P2PlansMain from 'calypso/my-sites/plans/p2-plans-main';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import { isTreatmentPlansReorderTest } from 'calypso/state/marketing/selectors';
import { getByPurchaseId } from 'calypso/state/purchases/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isEligibleForWpComMonthlyPlan from 'calypso/state/selectors/is-eligible-for-wpcom-monthly-plan';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';

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

	renderPlaceholder = () => {
		return (
			<div>
				<DocumentHead title={ this.props.translate( 'Plans', { textOnly: true } ) } />
				<Main wideLayout>
					<SidebarNavigation />

					<div id="plans" className="plans plans__has-sidebar" />
				</Main>
			</div>
		);
	};

	render() {
		const {
			selectedSite,
			translate,
			canAccessPlans,
			customerType,
			isWPForTeamsSite,
			showTreatmentPlansReorderTest,
		} = this.props;

		if ( ! selectedSite || this.isInvalidPlanInterval() ) {
			return this.renderPlaceholder();
		}

		return (
			<div>
				{ selectedSite.ID && <QuerySitePurchases siteId={ selectedSite.ID } /> }
				<DocumentHead title={ translate( 'Plans', { textOnly: true } ) } />
				<PageViewTracker path="/plans/:site" title="Plans" />
				<QueryContactDetailsCache />
				<TrackComponentView eventName="calypso_plans_view" />
				<Main wideLayout>
					<SidebarNavigation />
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
								subHeaderText={ translate(
									'See and compare the features available on each WordPress.com plan.'
								) }
								align="left"
							/>
							<div id="plans" className="plans plans__has-sidebar">
								<PlansNavigation path={ this.props.context.path } />
								{ isEnabled( 'p2/p2-plus' ) && isWPForTeamsSite ? (
									<P2PlansMain
										selectedPlan={ this.props.selectedPlan }
										redirectTo={ this.props.redirectTo }
										site={ selectedSite }
										withDiscount={ this.props.withDiscount }
										discountEndDate={ this.props.discountEndDate }
									/>
								) : (
									<PlansFeaturesMain
										redirectToAddDomainFlow={ this.props.redirectToAddDomainFlow }
										hideFreePlan={ true }
										customerType={ customerType }
										intervalType={ this.props.intervalType }
										selectedFeature={ this.props.selectedFeature }
										selectedPlan={ this.props.selectedPlan }
										redirectTo={ this.props.redirectTo }
										withDiscount={ this.props.withDiscount }
										discountEndDate={ this.props.discountEndDate }
										site={ selectedSite }
										plansWithScroll={ false }
										showTreatmentPlansReorderTest={ showTreatmentPlansReorderTest }
									/>
								) }
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
		currentPlanIntervalType,
		purchase: currentPlan ? getByPurchaseId( state, currentPlan.id ) : null,
		selectedSite: getSelectedSite( state ),
		canAccessPlans: canCurrentUser( state, getSelectedSiteId( state ), 'manage_options' ),
		isWPForTeamsSite: isSiteWPForTeams( state, selectedSiteId ),
		isSiteEligibleForMonthlyPlan: isEligibleForWpComMonthlyPlan( state, selectedSiteId ),
		showTreatmentPlansReorderTest: isTreatmentPlansReorderTest( state ),
	};
} )( localize( withTrackingTool( 'HotJar' )( Plans ) ) );
