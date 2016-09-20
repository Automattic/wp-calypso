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
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import Main from 'components/main';
import PlansFeaturesMain from 'my-sites/plans-features-main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import UpgradesNavigation from 'my-sites/upgrades/navigation';
import QueryPlans from 'components/data/query-plans';
import QuerySitePlans from 'components/data/query-site-plans';

const Plans = React.createClass( {
	propTypes: {
		cart: React.PropTypes.object.isRequired,
		context: React.PropTypes.object.isRequired,
		intervalType: React.PropTypes.string,
		plans: React.PropTypes.array.isRequired,
		selectedSite: React.PropTypes.object.isRequired,
		selectedSiteId: React.PropTypes.number.isRequired,
		sitePlans: React.PropTypes.object.isRequired
	},

	getDefaultProps() {
		return {
			intervalType: 'yearly'
		};
	},

	render() {
		return (
			<div>
				<Main wideLayout={ true } >
					<SidebarNavigation />

					<div id="plans" className="plans has-sidebar">
						<UpgradesNavigation
							sitePlans={ this.props.sitePlans }
							path={ this.props.context.path }
							cart={ this.props.cart }
							selectedSite={ this.props.site } />

						<QueryPlans />
						<QuerySitePlans siteId={ this.props.siteId } />

						<PlansFeaturesMain
							site={ this.props.selectedSite }
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
	( state ) => ( {
		plans: getPlans( state ),
		sitePlans: getPlansBySite( state, getSelectedSiteId( state ) ),
		selectedSite: getSelectedSite( state ),
		selectedSiteId: getSelectedSiteId( state )
	} )
)( Plans );
