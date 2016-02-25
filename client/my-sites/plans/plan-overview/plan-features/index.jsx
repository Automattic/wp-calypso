/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import PlanFeature from '../plan-feature';
import PlanProgress from '../plan-progress';
import SectionHeader from 'components/section-header';
import { isBusiness } from 'lib/products-values';
import { isInGracePeriod } from 'lib/plans';

const PlanFeatures = React.createClass( {
	propTypes: {
		plan: React.PropTypes.object.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired
	},

	renderBusinessFeatures() {
		const willBeRemoved = isInGracePeriod( this.props.plan );

		return (
			<div>
				<PlanFeature
					button={ { label: this.translate( 'View Themes' ), href: `/design/${ this.props.selectedSite.slug }` } }
					description={ this.translate( 'You have access to dozens of our best themes available.' ) }
					heading={ this.translate( 'Unlimited Premium Themes' ) }
					removalMessage={ this.translate( 'Theme changes will be lost' ) }
					willBeRemoved={ willBeRemoved } />

				<PlanFeature
					button={ { label: this.translate( 'Set up Analytics' ), href: `/settings/analytics/${ this.props.selectedSite.slug }` } }
					description={ this.translate( 'Connect your Google Analytics account.' ) }
					heading={ this.translate( 'Google Analytics Integration' ) }
					willBeRemoved={ willBeRemoved } />
			</div>
		);
	},

	render() {
		const willBeRemoved = isInGracePeriod( this.props.plan );

		return (
			<div>
				{ ! willBeRemoved && <SectionHeader label={ this.translate( "Your Site's Features" ) } /> }
				{ willBeRemoved && <PlanProgress plan={ this.props.plan } /> }

				<PlanFeature
					button={ { label: this.translate( 'Customize' ), href: `/customize/${ this.props.selectedSite.slug }` } }
					description={ this.translate( "Change your theme's fonts, colors, and CSS for a unique look." ) }
					removalMessage={ this.translate( 'Changes will be lost' ) }
					heading={ this.translate( 'Custom Design' ) }
					willBeRemoved={ willBeRemoved } />

				{ isBusiness( this.props.selectedSite.plan ) && this.renderBusinessFeatures() }

				<PlanFeature
					description={ this.translate( 'WordPress.com ads will not display on your site.' ) }
					heading={ this.translate( 'No Ads' ) }
					willBeRemoved={ willBeRemoved } />

				<PlanFeature
					description={
						isBusiness( this.props.selectedSite.plan )
						? this.translate( 'You can upload unlimited photos, videos, or music.' )
						: this.translate( 'You can upload up to 10GB of photos, videos, or music.' )
					}
					heading={ this.translate( 'Storage Space' ) }
					willBeRemoved={ willBeRemoved } />

				<PlanFeature
					description={ this.translate( 'You can upload and host videos on your site without advertising.' ) }
					heading={ this.translate( 'VideoPress' ) }
					willBeRemoved={ willBeRemoved } />

				<PlanFeature
					description={
						isBusiness( this.props.selectedSite.plan )
						? this.translate( 'You can live chat with our Happiness Engineers anytime you need.' )
						: this.translate( 'You can contact our Happiness Engineers anytime you need.' )
					}
					heading={ this.translate( 'Support' ) }
					willBeRemoved={ willBeRemoved } />
			</div>
		);
	}
} );

export default PlanFeatures;
