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
import { getPlansBySite } from 'state/sites/plans/selectors';
import { getCurrentPlan } from 'lib/plans';
import { getPlans } from 'state/plans/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import Gridicon from 'components/gridicon';
import { isJpphpBundle } from 'lib/products-values';
import Main from 'components/main';
import Notice from 'components/notice';
import observe from 'lib/mixins/data-observe';
import paths from './paths';
import PlansFeaturesMain from 'my-sites/plans-features-main';
import PlanOverview from './plan-overview';
import { plansLink } from 'lib/plans';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import UpgradesNavigation from 'my-sites/upgrades/navigation';
import QueryPlans from 'components/data/query-plans';
import QuerySitePlans from 'components/data/query-site-plans';
import { PLAN_MONTHLY_PERIOD } from 'lib/plans/constants';

const Plans = React.createClass( {
	mixins: [ observe( 'sites' ) ],

	propTypes: {
		cart: React.PropTypes.object.isRequired,
		context: React.PropTypes.object.isRequired,
		destinationType: React.PropTypes.string,
		intervalType: React.PropTypes.string,
		plans: React.PropTypes.array.isRequired,
		sites: React.PropTypes.object.isRequired,
		sitePlans: React.PropTypes.object.isRequired,
		transaction: React.PropTypes.object.isRequired
	},

	showMonthlyPlansLink() {
		const selectedSite = this.props.sites.getSelectedSite();
		if ( ! selectedSite.jetpack ) {
			return '';
		}

		let intervalType = this.props.intervalType,
			showString = '';
		const hasMonthlyPlans = find( this.props.sitePlans.data, { interval: PLAN_MONTHLY_PERIOD } );

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
			<a
				href={ plansLink( '/plans', selectedSite, intervalType ) }
				className="show-monthly-plans-link"
				onClick={ this.recordComparePlansClick }
			>
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
		const selectedSite = this.props.sites.getSelectedSite(),
			siteId = this.props.siteId;

		let	hasJpphpBundle,
			currentPlan;

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

				<Main wideLayout={ true } >
					<SidebarNavigation />

					<div id="plans" className="plans has-sidebar">
						<UpgradesNavigation
							sitePlans={ this.props.sitePlans }
							path={ this.props.context.path }
							cart={ this.props.cart }
							selectedSite={ selectedSite } />

						{ ! hasJpphpBundle && this.showMonthlyPlansLink() }

						<QueryPlans />
						<QuerySitePlans siteId={ siteId } />

						<PlansFeaturesMain
							site={ selectedSite }
							intervalType={ this.props.intervalType }
							hideFreePlan={ true }
							selectedFeature={ this.props.selectedFeature }
						/>
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
			sitePlans: getPlansBySite( state, props.sites.getSelectedSite() ),
			siteId: getSelectedSiteId( state )
		};
	}
)( Plans );
