/**
 * External dependencies
 */
import { connect } from 'react-redux';
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
import observe from 'lib/mixins/data-observe';
import PlansFeaturesMain from 'my-sites/plans-features-main';
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
		intervalType: React.PropTypes.string,
		plans: React.PropTypes.array.isRequired,
		sites: React.PropTypes.object.isRequired,
		sitePlans: React.PropTypes.object.isRequired
	},

	getDefaultProps() {
		return {
			intervalType: 'yearly'
		};
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
			>
				<Gridicon icon="refresh" size={ 18 } />
				{ showString }
			</a>
		);
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

		return (
			<div>
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
							intervalType={ this.props.intervalType }
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
