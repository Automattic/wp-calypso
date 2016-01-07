/**
 * External dependencies
 */
import React from 'react'
import classNames from 'classnames'

/**
 * Internal dependencies
 */
import Card from 'components/card'
import MainComponent from 'components/main'
import SectionHeader from 'components/section-header'
import SidebarNavigation from 'my-sites/sidebar-navigation'
import VaultPressInstructions from './plugins/vaultpress'
import AkismetInstructions from './plugins/akismet'
import PolldaddyInstructions from './plugins/polldaddy'

module.exports = React.createClass( {

	displayName: 'PlanSetupInstructions',

	getProductName: function( site ) {
		return site.plan.product_name_short || '';
	},

	renderPremium() {
		return (
			<ul className='plugin-plans'>
				<VaultPressInstructions />
				<AkismetInstructions />
			</ul>
		);
	},

	renderBusiness() {
		return (
			<ul className='plugin-plans'>
				<VaultPressInstructions />
				<AkismetInstructions />
				<PolldaddyInstructions />
			</ul>
		);
	},

	render() {
		let site = this.props.selectedSite;
		let classes = classNames( 'plugin__page' );
		let label = this.translate( 'Setting up your %s site', {
			args: this.getProductName( site ),
		} );

		let PlanDetails = null;

		if ( 'jetpack_premium' === site.plan.product_slug ) {
			PlanDetails = this.renderPremium();
		} else if ( 'jetpack_business' === site.plan.product_slug ) {
			PlanDetails = this.renderBusiness();
		}

		return (
			<MainComponent>
				<SidebarNavigation />
				<div className={ classes }>
					<SectionHeader label={ label } />
					<Card>
						{ PlanDetails }
					</Card>
				</div>
			</MainComponent>
		)
	}

} );
