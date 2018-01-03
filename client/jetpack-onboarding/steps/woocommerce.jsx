/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { JETPACK_ONBOARDING_STEPS as STEPS } from '../constants';

class JetpackOnboardingWoocommerceStep extends React.PureComponent {
	render() {
		const { translate } = this.props;
		const headerText = translate( 'Are you looking to sell online?' );
		const subHeaderText = translate(
			"We'll set you up with WooCommerce for all of your online selling needs."
		);

		return (
			<div className="steps__main">
				<DocumentHead title={ translate( 'WooCommerce ‹ Jetpack Onboarding' ) } />
				<PageViewTracker
					path={ '/jetpack/onboarding/' + STEPS.WOOCOMMERCE + '/:site' }
					title="WooCommerce ‹ Jetpack Onboarding"
				/>

				<FormattedHeader headerText={ headerText } subHeaderText={ subHeaderText } />

				<div className="steps__button-group">
					<Button primary>{ translate( 'Yes, I am' ) }</Button>
					<Button>{ translate( 'Not right now' ) }</Button>
				</div>
			</div>
		);
	}
}

export default localize( JetpackOnboardingWoocommerceStep );
