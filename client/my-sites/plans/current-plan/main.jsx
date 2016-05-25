/**
 * External Dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import page from 'page';
import classNames from 'classnames';

/**
 * Internal Dependencies
 */
import Main from 'components/main';
import Card from 'components/card';
import HappinessSupport from 'components/happiness-support';
import PremiumPlanDetails from 'my-sites/upgrades/checkout-thank-you/premium-plan-details';
import BusinessPlanDetails from 'my-sites/upgrades/checkout-thank-you/business-plan-details';
import PurchaseDetail from 'components/purchase-detail';
import { getPlansBySite } from 'state/sites/plans/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import { fetchSitePlans } from 'state/sites/plans/actions';
import {
	isBusiness,
	isPremium,
	isFreePlan
} from 'lib/products-values';
import Gridicon from 'components/gridicon';
import TrackComponentView from 'lib/analytics/track-component-view';

const PlanDetailsComponent = React.createClass( {
	PropTypes: {
		selectedSite: React.PropTypes.object.isRequired,
		sitePlans: React.PropTypes.object.isRequired,
		fetchPlans: React.PropTypes.func.isRequired
	},
	componentWillUpdate: function( props ) {
		this.props.fetchPlans( props );
	},
	componentDidMount: function() {
		this.props.fetchPlans();
	},
	render: function() {
		const { selectedSite } = this.props;
		const { hasLoadedFromServer } = this.props.sitePlans;
		let title;
		let tagLine;
		let featuresList;

		if ( ! selectedSite || ! hasLoadedFromServer ) {
			featuresList = (
				<div>
						<PurchaseDetail isPlaceholder />
						<PurchaseDetail isPlaceholder />
				</div>
			);
		} else if ( selectedSite.jetpack || isFreePlan( selectedSite.plan ) ) {
			page.redirect( `/plans/${ selectedSite.slug }` );
		} else if ( isPremium( selectedSite.plan ) ) {
			title = this.translate( 'Your site is on a Premium plan' );
			tagLine = this.translate( 'Unlock the full potential of your site with the premium features included in your plan.' );
			featuresList = (
				<PremiumPlanDetails
					selectedSite={ selectedSite }
					sitePlans={ this.props.sitePlans }
				/>
			);
		} else if ( isBusiness( selectedSite.plan ) ) {
			title = this.translate( 'Your site is on a Business plan' );
			tagLine = this.translate( 'Learn more about everything included with Business and take advantage of its professional features.' );
			featuresList = ( <div>
				<BusinessPlanDetails
					selectedSite={ selectedSite }
					sitePlans={ this.props.sitePlans }
				/>
				<PremiumPlanDetails
					selectedSite={ selectedSite }
					sitePlans={ this.props.sitePlans }
				/>
			</div> );
		}

		return (
			<Main className="current-plan">
				<Card>
					<div className="current-plan__header">
						<div className="current-plan__header-content">
							<span className="current-plan__header-icon">
								<Gridicon icon="star" size={ 48 } />
							</span>

							<div className="current-plan__header-copy">
								<h1 className={ classNames( { 'current-plan__header-heading': true, 'is-placeholder': ! hasLoadedFromServer } ) }>
									{ title }
								</h1>

								<h2 className={ classNames( { 'current-plan__header-text': true, 'is-placeholder': ! hasLoadedFromServer } ) }>
									{ tagLine }
								</h2>
							</div>
						</div>
					</div>
					{ featuresList }
				</Card>
				<Card>
					<HappinessSupport
						isJetpack={ false }
						isPlaceholder={ false } />
				</Card>
				{ selectedSite &&
					<Card href={ '/plans/compare/' + selectedSite.slug }>
						{ this.translate( 'Missing some features? Compare our different plans' ) }
					</Card>
				}
				<TrackComponentView eventName={ 'calypso_plans_my-plan_view' } />
			</Main>
		);
	}
} );

export default connect(
	( state ) => {
		return {
			selectedSite: getSelectedSite( state ),
			sitePlans: getPlansBySite( state, getSelectedSite( state ) )
		};
	},
	dispatch => ( {
		fetchSitePlans: siteId => dispatch( fetchSitePlans( siteId ) )
	} ),
	( stateProps, dispatchProps ) => {
		function fetchPlans( props = stateProps ) {
			if (
				props.selectedSite &&
				! props.sitePlans.hasLoadedFromServer &&
				! props.sitePlans.isRequesting
			) {
				dispatchProps.fetchSitePlans( props.selectedSite.ID );
			}
		}

		return Object.assign( { fetchPlans }, stateProps );
	}
)( PlanDetailsComponent );
