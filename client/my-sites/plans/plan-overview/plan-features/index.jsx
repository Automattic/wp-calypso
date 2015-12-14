/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import PlanFeature from './feature'
import SectionHeader from 'components/section-header';

const PlanFeatures = React.createClass( {
	propTypes: {
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired
	},

	goToCustomizer() {
		page( `/customize/${ this.props.selectedSite.slug }` );
	},

	goToGoogleAnalytics() {
		page( `/settings/analytics/${ this.props.selectedSite.slug }` );
	},

	goToPlugins() {
		page( `/plugins/${ this.props.selectedSite.slug }` );
	},

	render() {
		return (
			<div>
				<SectionHeader label={ this.translate( "Your Site's Features" ) } />

				<PlanFeature
					button={ { label: this.translate( 'Customize' ), onClick: this.goToCustomizer } }
					description={ this.translate( "Change your theme's fonts, colors, and CSS for a unique look." ) }
					heading={ this.translate( 'Custom Design' ) } />

				<PlanFeature
					button={ { label: this.translate( 'Setup eCommerce' ), onClick: this.goToPlugins } }
					description={ this.translate( 'Connect your Shopify, Ecwid, or Gumroad account to your WordPress.com site.' ) }
					heading={ this.translate( 'eCommerce Integration' ) } />

				<PlanFeature
					button={ { label: this.translate( 'Setup Analytics' ), onClick: this.goToGoogleAnalytics } }
					description={ this.translate( 'Connect your Google Analytics account.' ) }
					heading={ this.translate( 'Google Analytics Integration' ) } />
			</div>
		);
	}
} );

export default PlanFeatures;
