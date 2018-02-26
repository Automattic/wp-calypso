/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { JETPACK_ONBOARDING_STEPS as STEPS } from '../constants';
import {
	getJetpackOnboardingCompletedSteps,
	getJetpackOnboardingPendingSteps,
} from 'state/selectors';

class JetpackOnboardingWoocommerceStep extends React.PureComponent {
	handleWooCommerceInstallation = () => {
		this.props.recordJpoEvent( 'calypso_jpo_woocommerce_install_clicked' );

		this.props.saveJpoSettings( this.props.siteId, {
			installWooCommerce: true,
		} );
	};

	handleWooCommerceInstallationSkip = () => {
		this.props.recordJpoEvent( 'calypso_jpo_woocommerce_skip_install_clicked' );
	};

	render() {
		const { basePath, getForwardUrl, stepsCompleted, stepsPending, translate } = this.props;
		const headerText = translate( 'Are you looking to sell online?' );
		const subHeaderText = translate(
			"We'll set you up with WooCommerce for all of your online selling needs."
		);
		const forwardUrl = getForwardUrl();
		const isPending = get( stepsPending, STEPS.WOOCOMMERCE );
		const isCompleted = get( stepsCompleted, STEPS.WOOCOMMERCE ) === true;

		return (
			<div className="steps__main">
				<DocumentHead title={ translate( 'WooCommerce ‹ Jetpack Start' ) } />
				<PageViewTracker
					path={ [ basePath, STEPS.WOOCOMMERCE, ':site' ].join( '/' ) }
					title="WooCommerce ‹ Jetpack Start"
				/>

				<FormattedHeader headerText={ headerText } subHeaderText={ subHeaderText } />

				<div className="steps__button-group">
					{ isPending || isCompleted ? (
						<Button disabled>
							{ isPending ? translate( 'Installing…' ) : translate( 'Installed' ) }
						</Button>
					) : (
						<div>
							<Button href={ forwardUrl } onClick={ this.handleWooCommerceInstallation } primary>
								{ translate( 'Yes, I am' ) }
							</Button>
							<Button href={ forwardUrl } onClick={ this.handleWooCommerceInstallationSkip }>
								{ translate( 'Not right now' ) }
							</Button>
						</div>
					) }
				</div>
			</div>
		);
	}
}

export default connect( ( state, { siteId, steps } ) => ( {
	stepsCompleted: getJetpackOnboardingCompletedSteps( state, siteId, steps ),
	stepsPending: getJetpackOnboardingPendingSteps( state, siteId, steps ),
} ) )( localize( JetpackOnboardingWoocommerceStep ) );
