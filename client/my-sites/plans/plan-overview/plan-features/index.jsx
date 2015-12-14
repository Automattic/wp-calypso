/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import CompactCard from 'components/card/compact';
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

				<CompactCard className="plan-features__feature">
					<div className="plan-features__feature-description">
						<strong>{ this.translate( 'Custom Design' ) }</strong>
						<em>{ this.translate( "Change your theme's fonts, colors, and CSS for a unique look." ) }</em>
					</div>

					<Button
						className="plan-features__feature-button"
						onClick={ this.goToCustomizer }
						primary>
						{ this.translate( 'Customize' ) }
					</Button>
				</CompactCard>

				<CompactCard className="plan-features__feature">
					<div className="plan-features__feature-description">
						<strong>{ this.translate( 'eCommerce Integration' ) }</strong>
						<em>{ this.translate( 'Connect your Shopify, Ecwid, or Gumroad account to your WordPress.com site.' ) }</em>
					</div>

					<Button
						className="plan-features__feature-button"
						onClick={ this.goToPlugins }
						primary>
						{ this.translate( 'Setup eCommerce' ) }
					</Button>
				</CompactCard>

				<CompactCard className="plan-features__feature">
					<div className="plan-features__feature-description">
						<strong>{ this.translate( 'Google Analytics Integration' ) }</strong>
						<em>{ this.translate( 'Connect your Google Analytics account.' ) }</em>
					</div>

					<Button
						className="plan-features__feature-button"
						onClick={ this.goToGoogleAnalytics }
						primary>
						{ this.translate( 'Setup Analytics' ) }
					</Button>
				</CompactCard>
			</div>
		);
	}
} );

export default PlanFeatures;
