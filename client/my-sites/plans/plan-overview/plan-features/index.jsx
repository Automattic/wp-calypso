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

				<PlanFeature
					description={ this.translate( 'You have access to dozens of our best themes available.' ) }
					heading={ this.translate( 'Unlimited Premium Themes' ) } />

				<PlanFeature
					description={ this.translate( 'WordPress.com ads will not display on your site.' ) }
					heading={ this.translate( 'No Ads' ) } />

				<PlanFeature
					description={ this.translate( 'You can upload unlimited photos, videos, or music.' ) }
					heading={ this.translate( 'Storage Space' ) } />

				<PlanFeature
					description={ this.translate( 'You can upload and hosts videos on your site without advertising.' ) }
					heading={ this.translate( 'VideoPress' ) } />

				<PlanFeature
					description={ this.translate( 'You can live chat with our happiness engineers anytime you need.' ) }
					heading={ this.translate( 'Support' ) } />
			</div>
		);
	}
} );

export default PlanFeatures;
