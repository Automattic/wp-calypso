/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import FormattedHeader from 'components/formatted-header';
import PlansFeaturesMain from 'my-sites/plans-features-main';
/**
 * Constants
 */
const defaultJetpackSite = { jetpack: true, plan: {}, isUpgradeable: () => true };

class JetpackPlansGrid extends Component {
	static propTypes = {
		basePlansPath: PropTypes.string,
		hideFreePlan: PropTypes.bool,
		interval: PropTypes.string,
		isLanding: PropTypes.bool,
		onSelect: PropTypes.func,
		selectedSite: PropTypes.object,

		// Connected
		translate: PropTypes.func.isRequired,
	};

	renderConnectHeader() {
		const { isLanding, translate } = this.props;

		const headerText = translate( 'Explore our Jetpack plans' );
		let subheaderText = translate( "Now that you're set up, pick a plan that fits your needs." );

		if ( isLanding ) {
			subheaderText = translate( 'Pick a plan that fits your needs.' );
		}
		return <FormattedHeader headerText={ headerText } subHeaderText={ subheaderText } />;
	}

	render() {
		return (
			<Main wideLayout className="jetpack-connect__hide-plan-icons">
				<div className="jetpack-connect__plans">
					{ this.renderConnectHeader() }
					<div id="plans">
						<PlansFeaturesMain
							site={ this.props.selectedSite || defaultJetpackSite }
							isInSignup={ true }
							isLandingPage={ ! this.props.selectedSite }
							basePlansPath={ this.props.basePlansPath }
							onUpgradeClick={ this.props.onSelect }
							intervalType={ this.props.interval }
							hideFreePlan={ this.props.hideFreePlan }
							displayJetpackPlans={ true }
						/>
						{ this.props.children }
					</div>
				</div>
			</Main>
		);
	}
}

export default localize( JetpackPlansGrid );
