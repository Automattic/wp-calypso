/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React, { Component } from 'react';
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
		showFirst: PropTypes.bool,
	};

	renderConnectHeader() {
		const {
			isLanding,
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
		}
		return (
			<FormattedHeader
				headerText={ headerText }
				subHeaderText={ subheaderText }
			/>
		);
	}

	render() {
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
