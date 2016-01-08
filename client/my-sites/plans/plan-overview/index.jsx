/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import PlanFeatures from 'my-sites/plans/plan-overview/plan-features';
import PlanOverviewNotice from './notice.jsx';
import PlanStatus from 'my-sites/plans/plan-overview/plan-status';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import UpgradesNavigation from 'my-sites/upgrades/navigation';

const PlanOverview = React.createClass( {
	propTypes: {
		cart: React.PropTypes.object.isRequired,
		destinationType: React.PropTypes.string,
		plan: React.PropTypes.object.isRequired,
		path: React.PropTypes.string.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired
	},

	render() {
		return (
			<div>
				<PlanOverviewNotice
					destinationType={ this.props.destinationType }
					plan={ this.props.plan } />

				<Main className="plan-overview">
					<SidebarNavigation />

					<UpgradesNavigation
						cart={ this.props.cart }
						path={ this.props.path }
						selectedSite={ this.props.selectedSite } />

					<PlanStatus
						plan={ this.props.plan }
						selectedSite={ this.props.selectedSite } />

					<PlanFeatures
						plan={ this.props.plan }
						selectedSite={ this.props.selectedSite } />
				</Main>
			</div>
		);
	}
} );

export default PlanOverview;
