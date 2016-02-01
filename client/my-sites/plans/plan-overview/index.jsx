/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import paths from '../paths';
import PlanFeatures from './plan-features';
import PlanRemove from './plan-remove';
import PlanStatus from './plan-status';
import Notice from 'components/notice';
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

	redirectToDefault() {
		page.redirect( paths.plans( this.props.selectedSite.slug ) );
	},

	renderNotice() {
		if ( 'thank-you' === this.props.destinationType ) {
			return (
				<Notice onDismissClick={ this.redirectToDefault } status="is-success">
					{
						this.translate( 'Hooray, you just started your 14 day free trial of %(planName)s. Enjoy!', {
							args: { planName: this.props.plan.productName }
						} )
					}
				</Notice>
			);
		}
	},

	render() {
		return (
			<div>
				{ this.renderNotice() }

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

					<PlanRemove
						plan={ this.props.plan }
						selectedSite={ this.props.selectedSite } />
				</Main>
			</div>
		);
	}
} );

export default PlanOverview;
