/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import MainComponent from 'components/main';
import SectionHeader from 'components/section-header';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import plugins from './plugins.js';
import Button from 'components/button';

module.exports = React.createClass( {

	displayName: 'PlanSetupInstructions',

	getProductName: function( site ) {
		return site.plan.product_name_short || '';
	},

	renderInstructions( plugin ) {
		return (
			<li className={ 'plugin-plan ' + this.props.additionalClass } key={ plugin.name }>
				<div className="plugin-plan__details">
					<h3>{ plugin.name }</h3>
					<p>{ plugin.description }</p>
				</div>
				<Button href={ plugin.buttonHref }>{ plugin.buttonDescription }</Button>
			</li>
		);
	},

	renderPlugins( filteredPlugins ) {
		return (
			<ul className="plugin-plans">
				{ filteredPlugins.map( this.renderInstructions ) }
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
		let filteredPlugins = [];
		if ( 'jetpack_premium' === site.plan.product_slug ) {
			filteredPlugins = plugins.filter( ( plugin ) => {
				return plugin.isPremium;
			} );
		} else if ( 'jetpack_business' === site.plan.product_slug ) {
			filteredPlugins = plugins.filter( ( plugin ) => {
				return plugin.isBusiness;
			} );
		}
		PlanDetails = this.renderPlugins( filteredPlugins );

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
