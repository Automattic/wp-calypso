/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import StepHeader from '../step-header';
import PlansFeaturesMain from 'my-sites/plans-features-main';

export default React.createClass( {
	displayName: 'JetpackPlansGrid',

	renderConnectHeader() {
		let headerText = this.translate( 'Your site is now connected!' );
		let subheaderText = this.translate( 'Now pick a plan that\'s right for you.' );
		if ( this.props.showFirst ) {
			headerText = this.translate( 'You are moments away from connecting your site' );
		}
		if ( this.props.isLanding ) {
			headerText = this.translate( 'Pick a plan that\'s right for you.' );
			subheaderText = '';

			if ( this.props.landingType === 'vaultpress' ) {
				headerText = this.translate( 'Select your VaultPress plan.' );
				subheaderText = this.translate( 'VaultPress backup and security plans are now cheaper as part of Jetpack.' );
			}
		}
		return (
			<StepHeader
				headerText={ headerText }
				subHeaderText={ subheaderText }
				step={ 1 }
				steps={ 3 } />
		);
	},

	render() {
		const defaultJetpackSite = { jetpack: true, plan: {}, isUpgradeable: () => true };
		return (
			<Main wideLayout>
				<div className="jetpack-connect__plans">
					{ this.renderConnectHeader() }
					<div id="plans">
						<PlansFeaturesMain
							site={ this.props.selectedSite || defaultJetpackSite }
							isInSignup={ true }
							isLandingPage={ ! this.props.selectedSite }
							basePlansPath={ this.props.basePlansPath }
							onUpgradeClick={ this.props.onSelect }
							intervalType={ this.props.intervalType }
							hideFreePlan={ this.props.hideFreePlan }
							displayJetpackPlans={ true } />
					</div>
				</div>
			</Main>
		);
	}
} );
