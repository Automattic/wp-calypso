/**
 * External dependencies
 */

import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import canCurrentUser from 'state/selectors/can-current-user';
import Main from 'components/main';
import EmptyContent from 'components/empty-content';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import PlansFeaturesMain from 'my-sites/plans-features-main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import FormattedHeader from 'components/formatted-header';
import TrackComponentView from 'lib/analytics/track-component-view';
import PlansNavigation from 'my-sites/plans/navigation';
import isSiteAutomatedTransferSelector from 'state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'state/sites/selectors';
import QueryContactDetailsCache from 'components/data/query-contact-details-cache';
import withTrackingTool from 'lib/analytics/with-tracking-tool';
import { getByPurchaseId } from 'state/purchases/selectors';
import QuerySitePurchases from 'components/data/query-site-purchases';
import { getCurrentPlan } from 'state/sites/plans/selectors';
import CartData from 'components/data/cart';
import { PerformanceTrackerStop } from 'lib/performance-tracking';

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
		const { displayJetpackPlans, intervalType, selectedSite } = this.props;
		const isJetpack2Yearly = displayJetpackPlans && intervalType === '2yearly';
		const isWpcomMonthly = ! displayJetpackPlans && intervalType === 'monthly';

		return selectedSite && ( isJetpack2Yearly || isWpcomMonthly );
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
								<CartData>
									<PlansNavigation path={ this.props.context.path } />
								</CartData>
								<PlansFeaturesMain
									displayJetpackPlans={ displayJetpackPlans }
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
								/>
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

	return {
		purchase: currentPlan ? getByPurchaseId( state, currentPlan.id ) : null,
		selectedSite: getSelectedSite( state ),
		displayJetpackPlans: ! isSiteAutomatedTransfer && jetpackSite,
		canAccessPlans: canCurrentUser( state, getSelectedSiteId( state ), 'manage_options' ),
	};
} )( localize( withTrackingTool( 'HotJar' )( Plans ) ) );
