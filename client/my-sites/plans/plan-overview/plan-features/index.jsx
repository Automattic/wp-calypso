/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import PlanFeature from './feature'
import SectionHeader from 'components/section-header';
import { isBusiness } from 'lib/products-values';

const PlanFeatures = React.createClass( {
	propTypes: {
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired
	},

	renderBusinessFeatures() {
		return (
			<span>
				<PlanFeature
					button={ { label: this.translate( 'Setup eCommerce' ), href: `/plugins/${ this.props.selectedSite.slug }` } }
					description={ this.translate( 'Connect your Shopify, Ecwid, or Gumroad account to your WordPress.com site.' ) }
					heading={ this.translate( 'eCommerce Integration' ) } />

				<PlanFeature
					button={ { label: this.translate( 'Setup Analytics' ), href: `/settings/analytics/${ this.props.selectedSite.slug }` } }
					description={ this.translate( 'Connect your Google Analytics account.' ) }
					heading={ this.translate( 'Google Analytics Integration' ) } />

				<PlanFeature
					description={ this.translate( 'You have access to dozens of our best themes available.' ) }
					heading={ this.translate( 'Unlimited Premium Themes' ) } />
			</span>
		);
	},

	render() {
		return (
			<div>
				<SectionHeader label={ this.translate( "Your Site's Features" ) } />

				<PlanFeature
					button={ { label: this.translate( 'Customize' ), href: `/customize/${ this.props.selectedSite.slug }` } }
					description={ this.translate( "Change your theme's fonts, colors, and CSS for a unique look." ) }
					heading={ this.translate( 'Custom Design' ) } />

				{ isBusiness( this.props.selectedSite.plan ) ? this.renderBusinessFeatures() : null }

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
