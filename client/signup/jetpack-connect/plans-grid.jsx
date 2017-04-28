/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import StepHeader from '../step-header';
import PlansFeaturesMain from 'my-sites/plans-features-main';

class JetpackPlansGrid extends Component {
	static propTypes = {
		basePlansPath: PropTypes.string.isRequired,
		hideFreePlan: PropTypes.bool,
		intervalType: PropTypes.string,
		isLanding: PropTypes.bool,
		landingType: PropTypes.string,
		onSelect: PropTypes.func,
		selectedSite: PropTypes.object,
		showFirst: PropTypes.bool,
	};

	renderConnectHeader() {
		const {
			isLanding,
			landingType,
			showFirst,
			translate,
		} = this.props;

		let headerText = translate( 'Your site is now connected!' );
		let subheaderText = translate( 'Now pick a plan that\'s right for you.' );
		if ( showFirst ) {
			headerText = translate( 'You are moments away from connecting your site' );
		}
		if ( isLanding ) {
			headerText = translate( 'Pick a plan that\'s right for you.' );
			subheaderText = '';

			if ( landingType === 'vaultpress' ) {
				headerText = translate( 'Select your VaultPress plan.' );
				subheaderText = translate( 'VaultPress backup and security plans are now cheaper as part of Jetpack.' );
			}
		}
		return (
			<StepHeader
				headerText={ headerText }
				subHeaderText={ subheaderText }
				step={ 1 }
				steps={ 3 } />
		);
	}

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
}

export default localize( JetpackPlansGrid );
