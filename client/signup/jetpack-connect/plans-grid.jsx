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
		const headerText = this.props.showFirst || this.props.isLanding
			? this.translate( 'You are moments away from connecting your site' )
			: this.translate( 'Your site is now connected!' );
		return (
			<StepHeader
				headerText={ headerText }
				subHeaderText={ this.translate( 'Now pick a plan that\'s right for you.' ) }
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
							isInJetpackConnect={ true }
							onUpgradeClick={ this.props.onSelect }
							intervalType={ this.props.intervalType }
							hideFreePlan={ this.props.hideFreePlan } />
					</div>
				</div>
			</Main>
		);
	}
} );
