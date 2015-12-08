/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import PlanFeatures from './plan-features';
import PlanStatus from './plan-status';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import UpgradesNavigation from 'my-sites/upgrades/navigation';

const PlanOverview = React.createClass( {
	propTypes: {
		cart: React.PropTypes.object,
		path: React.PropTypes.string.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired
	},

	render() {
		return (
			<Main className="plan-overview">
				<SidebarNavigation />

				<UpgradesNavigation
					cart={ this.props.cart }
					path={ this.props.path }
					selectedSite={ this.props.selectedSite } />

				<PlanStatus />

				<PlanFeatures />
			</Main>
		);
	}
} );

export default PlanOverview;
