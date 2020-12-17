/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';
import page from 'page';
import { isEnabled } from 'calypso/config';

/**
 * Internal dependencies
 */
import DocumentHead from 'calypso/components/data/document-head';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import canCurrentUser from 'calypso/state/selectors/can-current-user';
import Main from 'calypso/components/main';
import EmptyContent from 'calypso/components/empty-content';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import PlansFeaturesMain from 'calypso/my-sites/plans-features-main';
import P2PlansMain from 'calypso/my-sites/plans/p2-plans-main';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import FormattedHeader from 'calypso/components/formatted-header';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import PlansNavigation from 'calypso/my-sites/plans/navigation';
import isSiteAutomatedTransferSelector from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import QueryContactDetailsCache from 'calypso/components/data/query-contact-details-cache';
import withTrackingTool from 'calypso/lib/analytics/with-tracking-tool';
import { getByPurchaseId } from 'calypso/state/purchases/selectors';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { PerformanceTrackerStop } from 'calypso/lib/performance-tracking';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { getPlan, isWpComPlan } from 'calypso/lib/plans';
import getIntervalTypeForTerm from 'calypso/lib/plans/get-interval-type-for-term';
import { isMonthly } from 'calypso/lib/plans/constants';
import { isTreatmentPlansReorderTest } from 'calypso/state/marketing/selectors';

class Plans extends React.Component {
	static propTypes = {
		context: PropTypes.object.isRequired,
		displayJetpackPlans: PropTypes.bool,
		intervalType: PropTypes.string,
		customerType: PropTypes.string,
		selectedFeature: PropTypes.string,
		redirectTo: PropTypes.string,
		selectedSite: PropTypes.object,
	};

	static defaultProps = {
		displayJetpackPlans: false,
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
		const { displayJetpackPlans, hasWpcomMonthlyPlan, intervalType, selectedSite } = this.props;
		const isJetpack2Yearly = displayJetpackPlans && intervalType === '2yearly';
		const isWpcomMonthly = ! displayJetpackPlans && intervalType === 'monthly';

		return selectedSite && ( isJetpack2Yearly || ( isWpcomMonthly && ! hasWpcomMonthlyPlan ) );
	}

	redirectIfInvalidPlanInterval() {
		const { currentPlanIntervalType, hasWpcomMonthlyPlan, selectedSite, intervalType } = this.props;

		if ( hasWpcomMonthlyPlan && currentPlanIntervalType !== intervalType ) {
			page.redirect( `/plans/${ currentPlanIntervalType }/${ selectedSite.slug }` );
			return;
		}

		if ( this.isInvalidPlanInterval() ) {
			page.redirect( '/plans/yearly/' + selectedSite.slug );
		}
	}

	renderPlaceholder = () => {
		return (
			<div>
				<DocumentHead title={ this.props.translate( 'Plans', { textOnly: true } ) } />
				<Main wideLayout={ true }>
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
			displayJetpackPlans,
			canAccessPlans,
			customerType,
			isWPForTeamsSite,
			hasWpcomMonthlyPlan,
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
				<Main wideLayout={ true }>
					<SidebarNavigation />
					{ ! canAccessPlans && (
						<EmptyContent
							illustration="/calypso/images/illustrations/illustration-404.svg"
							title={ translate( 'You are not authorized to view this page' ) }
						/>
					) }
					{ canAccessPlans && (
						<>
							<FormattedHeader brandFont headerText={ translate( 'Plans' ) } align="left" />
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
										displayJetpackPlans={ displayJetpackPlans }
										hideFreePlan={ true }
										customerType={ customerType }
										isMonthlyPricingTest={ hasWpcomMonthlyPlan }
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

	const jetpackSite = isJetpackSite( state, selectedSiteId );
	const isSiteAutomatedTransfer = isSiteAutomatedTransferSelector( state, selectedSiteId );
	const currentPlan = getCurrentPlan( state, selectedSiteId );
	let currentPlanIntervalType = getIntervalTypeForTerm( getPlan( currentPlan?.productSlug )?.term );

	if ( 'BRL' === currentPlan?.currencyCode ) {
		currentPlanIntervalType = 'yearly';
	}

	return {
		currentPlanIntervalType,
		purchase: currentPlan ? getByPurchaseId( state, currentPlan.id ) : null,
		selectedSite: getSelectedSite( state ),
		displayJetpackPlans: ! isSiteAutomatedTransfer && jetpackSite,
		canAccessPlans: canCurrentUser( state, getSelectedSiteId( state ), 'manage_options' ),
		isWPForTeamsSite: isSiteWPForTeams( state, selectedSiteId ),
		hasWpcomMonthlyPlan:
			isWpComPlan( currentPlan?.productSlug ) && isMonthly( currentPlan?.productSlug ),
		showTreatmentPlansReorderTest: isTreatmentPlansReorderTest( state ),
	};
} )( localize( withTrackingTool( 'HotJar' )( Plans ) ) );
