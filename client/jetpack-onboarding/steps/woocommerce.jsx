/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { JETPACK_ONBOARDING_STEPS as STEPS } from '../constants';
import { saveJetpackOnboardingSettings } from 'state/jetpack-onboarding/actions';

class JetpackOnboardingWoocommerceStep extends React.PureComponent {
	handleWooCommerceInstallation = () => {
		this.props.saveJetpackOnboardingSettings( this.props.siteId, {
			installWooCommerce: true,
		} );
	};

	render() {
		const { getForwardUrl, translate } = this.props;
		const headerText = translate( 'Are you looking to sell online?' );
		const subHeaderText = translate(
			"We'll set you up with WooCommerce for all of your online selling needs."
		);
		const forwardUrl = getForwardUrl();

		return (
			<div className="steps__main">
				<DocumentHead title={ translate( 'WooCommerce ‹ Jetpack Onboarding' ) } />
				<PageViewTracker
					path={ '/jetpack/onboarding/' + STEPS.WOOCOMMERCE + '/:site' }
					title="WooCommerce ‹ Jetpack Onboarding"
				/>

				<FormattedHeader headerText={ headerText } subHeaderText={ subHeaderText } />

				<div className="steps__button-group">
					<Button href={ forwardUrl } onClick={ this.handleWooCommerceInstallation } primary>
						{ translate( 'Yes, I am' ) }
					</Button>
					<Button href={ forwardUrl }>{ translate( 'Not right now' ) }</Button>
				</div>
			</div>
		);
	}
}

export default connect( null, { saveJetpackOnboardingSettings } )(
	localize( JetpackOnboardingWoocommerceStep )
);
