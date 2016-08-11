/**
 * External dependencies
 */
import { connect } from 'react-redux';
import React from 'react';

/**
 * Internal dependencies
 */
import { getPlansBySite } from 'state/sites/plans/selectors';
import { getPlans } from 'state/plans/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import Main from 'components/main';
import observe from 'lib/mixins/data-observe';
import PlansFeaturesMain from 'my-sites/plans-features-main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import UpgradesNavigation from 'my-sites/upgrades/navigation';
import QueryPlans from 'components/data/query-plans';
import QuerySitePlans from 'components/data/query-site-plans';

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

	render() {
		const selectedSite = this.props.sites.getSelectedSite(),
			siteId = this.props.siteId;

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
