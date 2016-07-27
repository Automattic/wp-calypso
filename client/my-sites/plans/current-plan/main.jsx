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
import JetpackPlanDetails from './jetpack';
import PersonalPlanDetails from 'my-sites/upgrades/checkout-thank-you/personal-plan-details';
import PremiumPlanDetails from 'my-sites/upgrades/checkout-thank-you/premium-plan-details';
import BusinessPlanDetails from 'my-sites/upgrades/checkout-thank-you/business-plan-details';
import PurchaseDetail from 'components/purchase-detail';
import { getPlansBySite } from 'state/sites/plans/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import { fetchSitePlans } from 'state/sites/plans/actions';
import {
	isBusiness,
	isPremium,
	isJetpackBusiness,
	isJetpackPremium,
	isPersonal,
	isFreePlan
} from 'lib/products-values';
import TrackComponentView from 'lib/analytics/track-component-view';
import PlansNavigation from 'my-sites/upgrades/navigation';
import { isPlanFeaturesEnabled } from 'lib/plans';
import PlanIcon from 'components/plans/plan-icon';

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
		const currentPlan = this.props.selectedSite.plan.product_slug;
		let title, tagLine, featuresList;

		if ( ! selectedSite || ! hasLoadedFromServer ) {
			featuresList = (
				<div>
						<PurchaseDetail isPlaceholder />
						<PurchaseDetail isPlaceholder />
				</div>
			);
		} else if ( isFreePlan( this.props.selectedSite.plan ) ) {
			page.redirect( '/plans/' + this.props.selectedSite.slug );
		} else if ( this.props.selectedSite.jetpack ) {
			title = this.translate( 'Your site is on a Free plan' );
			tagLine = this.translate( 'Unlock the full potential of your site with all the features included in your plan.' );

			if ( isJetpackPremium( this.props.selectedSite.plan ) ) {
				title = this.translate( 'Your site is on a Premium plan' );
			} else if ( isJetpackBusiness( this.props.selectedSite.plan ) ) {
				title = this.translate( 'Your site is on a Professional plan' );
			}

			featuresList = (
				<JetpackPlanDetails
					selectedSite={ this.props.selectedSite }
					sitePlans={ this.props.sitePlans }
				/>
			);
		} else if ( isPersonal( this.props.selectedSite.plan ) ) {
			title = this.translate( 'Your site is on a Personal plan' );
			tagLine = this.translate( 'Unlock the full potential of your site with all the features included in your plan.' );

			featuresList = (
				<PersonalPlanDetails
					selectedSite={ this.props.selectedSite }
					sitePlans={ this.props.sitePlans }
				/>
			);
		} else if ( isPremium( this.props.selectedSite.plan ) ) {
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
			tagLine = this.translate( 'Learn more about everything included with Business and take advantage of' +
				' its professional features.' );

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
			<Main
				className="current-plan"
				wideLayout={ isPlanFeaturesEnabled() }
			>
				<PlansNavigation
					sitePlans={ this.props.sitePlans }
					path={ this.props.context.path }
					selectedSite={ selectedSite }
				/>
				<Card>
					<div className="current-plan__header">
						<div className="current-plan__header-content">
							<div className="current-plan__header-icon">
								{
									currentPlan &&
										<PlanIcon plan={ currentPlan } />
								}
							</div>

							<div className="current-plan__header-copy">
								<h1 className={ classNames( {
									'current-plan__header-heading': true,
									'is-placeholder': ! hasLoadedFromServer
								} ) }>
									{ title }
								</h1>

								<h2 className={ classNames( {
									'current-plan__header-text': true,
									'is-placeholder': ! hasLoadedFromServer
								} ) }>
									{ tagLine }
								</h2>
							</div>
						</div>
					</div>
					{ featuresList }
				</Card>
				<Card>
					<HappinessSupport
						isJetpack={ !! this.props.selectedSite.jetpack }
						isPlaceholder={ false } />
				</Card>
				{ selectedSite &&
					<Card
						href={
							isPlanFeaturesEnabled()
								? `/plans/${ selectedSite.slug }`
								: `/plans/compare/${ selectedSite.slug }`
						}
					>
						{ this.translate( 'Missing some features? Compare our different plans' ) }
					</Card>
				}
				<TrackComponentView eventName={ 'calypso_plans_my-plan_view' } />
			</Main>
		);
	}
} );

export default connect(
	( state, ownProps ) => {
		return {
			selectedSite: getSelectedSite( state ),
			sitePlans: getPlansBySite( state, getSelectedSite( state ) ),
			context: ownProps.context
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
