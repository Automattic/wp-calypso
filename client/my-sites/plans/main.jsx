/**
 * External dependencies
 */
import { connect } from 'react-redux';
import page from 'page';
import React from 'react';
import find from 'lodash/find';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import { fetchSitePlans } from 'state/sites/plans/actions';
import { getPlansBySite } from 'state/sites/plans/selectors';
import { getCurrentPlan } from 'lib/plans';
import { getPlans } from 'state/plans/selectors';
import Gridicon from 'components/gridicon';
import { isJpphpBundle } from 'lib/products-values';
import Main from 'components/main';
import Notice from 'components/notice';
import observe from 'lib/mixins/data-observe';
import paths from './paths';
import OldPlanList from 'components/plans/plan-list' ;
import PlanFeaturesList from 'my-sites/plan-features-list';
import PlanOverview from './plan-overview';
import { shouldFetchSitePlans, plansLink } from 'lib/plans';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import { SUBMITTING_WPCOM_REQUEST } from 'lib/store-transactions/step-types';
import UpgradesNavigation from 'my-sites/upgrades/navigation';
import QueryPlans from 'components/data/query-plans';
import { PLAN_MONTHLY_PERIOD } from 'lib/plans/constants';
import { abtest } from 'lib/abtest';

const showPlanFeatures = abtest( 'planFeatures' ) === 'show';

const Plans = React.createClass( {
	mixins: [ observe( 'sites' ) ],

	propTypes: {
		cart: React.PropTypes.object.isRequired,
		context: React.PropTypes.object.isRequired,
		destinationType: React.PropTypes.string,
		intervalType: React.PropTypes.string,
		plans: React.PropTypes.array.isRequired,
		fetchSitePlans: React.PropTypes.func.isRequired,
		sites: React.PropTypes.object.isRequired,
		sitePlans: React.PropTypes.object.isRequired,
		transaction: React.PropTypes.object.isRequired
	},

	getInitialState() {
		return { openPlan: '' };
	},

	componentDidMount() {
		this.updateSitePlans( this.props.sitePlans );
	},

	componentWillReceiveProps( nextProps ) {
		this.updateSitePlans( nextProps.sitePlans );
	},

	updateSitePlans( sitePlans ) {
		const selectedSite = this.props.sites.getSelectedSite();

		this.props.fetchSitePlans( sitePlans, selectedSite );
	},

	openPlan( planId ) {
		this.setState( { openPlan: planId === this.state.openPlan ? '' : planId } );
	},

	recordComparePlansClick() {
		analytics.ga.recordEvent( 'Upgrades', 'Clicked Compare Plans Link' );
	},

	comparePlansLink() {
		if ( this.props.plans.length <= 0 ) {
			return '';
		}

		const selectedSite = this.props.sites.getSelectedSite();
		let url = plansLink( '/plans/compare', selectedSite, this.props.intervalType ),
			compareString = this.translate( 'Compare Plans' );

		if ( selectedSite.jetpack ) {
			compareString = this.translate( 'Compare Options' );
		}

		return (
			<a href={ url } className="compare-plans-link" onClick={ this.recordComparePlansClick }>
				<Gridicon icon="clipboard" size={ 18 } />
				{ compareString }
			</a>
		);
	},

	showMonthlyPlansLink() {
		const selectedSite = this.props.sites.getSelectedSite();
		if ( !selectedSite.jetpack ) {
			return '';
		}

		let intervalType = this.props.intervalType,
			showString = '',
			hasMonthlyPlans = find( this.props.sitePlans.data, { interval: PLAN_MONTHLY_PERIOD } );

		if ( hasMonthlyPlans === undefined ) {
			//No monthly plan found for this site so no need for a monthly plans link
			return '';
		}

		if ( 'monthly' === intervalType ) {
			intervalType = '';
			showString = this.translate( 'Show Yearly Plans' );
		} else {
			intervalType = 'monthly';
			showString = this.translate( 'Show Monthly Plans' );
		}

		return (
			<a href={ plansLink( '/plans', selectedSite, intervalType ) } className="show-monthly-plans-link" onClick={ this.recordComparePlansClick }>
				<Gridicon icon="refresh" size={ 18 } />
				{ showString }
			</a>
		);
	},

	redirectToDefault() {
		page.redirect( paths.plans( this.props.sites.getSelectedSite().slug ) );
	},

	renderNotice() {
		if ( 'free-trial-canceled' === this.props.destinationType ) {
			return (
				<Notice onDismissClick={ this.redirectToDefault } status="is-success">
					{ this.translate( 'Your trial has been removed. Thanks for giving it a try!' ) }
				</Notice>
			);
		}
	},

	render() {
		const selectedSite = this.props.sites.getSelectedSite();
		let PlanList = OldPlanList;
		let hasJpphpBundle,
			currentPlan,
			mainStyle;

		if ( showPlanFeatures ) {
			PlanList = PlanFeaturesList;
			mainStyle = { maxWidth: 1040 };
		}

		if ( this.props.sitePlans.hasLoadedFromServer ) {
			currentPlan = getCurrentPlan( this.props.sitePlans.data );
			hasJpphpBundle = isJpphpBundle( currentPlan );
		}

		if ( this.props.sitePlans.hasLoadedFromServer && currentPlan.freeTrial ) {
			return (
				<PlanOverview
					sitePlans={ this.props.sitePlans }
					path={ this.props.context.path }
					cart={ this.props.cart }
					destinationType={ this.props.context.params.destinationType }
					plan={ currentPlan }
					selectedSite={ selectedSite } />
			);
		}

		return (
			<div>
				{ this.renderNotice() }

				<Main style={ mainStyle }>
					<SidebarNavigation />

					<div id="plans" className="plans has-sidebar">
						<UpgradesNavigation
							sitePlans={ this.props.sitePlans }
							path={ this.props.context.path }
							cart={ this.props.cart }
							selectedSite={ selectedSite } />

						{ ! hasJpphpBundle && this.showMonthlyPlansLink() }
						<QueryPlans />

						<PlanList
							site={ selectedSite }
							plans={ this.props.plans }
							sitePlans={ this.props.sitePlans }
							onOpen={ this.openPlan }
							cart={ this.props.cart }
							intervalType={ this.props.intervalType }
							isSubmitting={ this.props.transaction.step.name === SUBMITTING_WPCOM_REQUEST } />

						{ ! hasJpphpBundle && this.comparePlansLink() }
					</div>
				</Main>
			</div>
		);
	}
} );

export default connect(
	( state, props ) => {
		return {
			plans: getPlans( state ),
			sitePlans: getPlansBySite( state, props.sites.getSelectedSite() )
		};
	},

	dispatch => {
		return {
			fetchSitePlans( sitePlans, site ) {
				if ( shouldFetchSitePlans( sitePlans, site ) ) {
					dispatch( fetchSitePlans( site.ID ) );
				}
			}
		};
	}
)( Plans );
