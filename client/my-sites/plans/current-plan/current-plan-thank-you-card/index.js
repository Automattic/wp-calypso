/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import getJetpackProductInstallProgress from 'state/selectors/get-jetpack-product-install-progress';
import JetpackProductInstall from 'my-sites/plans/current-plan/jetpack-product-install';
import ProgressBar from 'components/progress-bar';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';

export class CurrentPlanThankYouCard extends Component {
	getMyPlanRoute() {
		const { siteSlug } = this.props;

		return `/plans/my-plan/${ siteSlug }`;
	}

	renderSetup() {
		const { progressComplete, translate } = this.props;

		return (
			<Fragment>
				<img
					className="current-plan-thank-you-card__illustration"
					alt=""
					aria-hidden="true"
					src="/calypso/images/illustrations/fireworks.svg"
				/>
				<h1 className="current-plan-thank-you-card__title">
					{ translate( 'Thank you for your purchase!' ) }
				</h1>
				<p>{ translate( "Now let's make sure your site is protected." ) }</p>
				<p>
					{ translate(
						"We're setting up spam filters and site backups for you first. Once that's done, our security checklist will guide you through the next steps."
					) }
				</p>

				<ProgressBar isPulsing total={ 100 } value={ progressComplete || 0 } />

				<p>
					<a href={ this.getMyPlanRoute() }>{ translate( 'Skip setup. I’ll do this later.' ) }</a>
				</p>
			</Fragment>
		);
	}

	renderSuccess() {
		const { translate } = this.props;

		return (
			<Fragment>
				<img
					className="current-plan-thank-you-card__illustration"
					alt=""
					aria-hidden="true"
					src="/calypso/images/illustrations/security.svg"
				/>
				<h1 className="current-plan-thank-you-card__title">
					{ translate( 'So long spam, hello backups!' ) }
				</h1>
				<p>
					{ translate( 'We’ve finished setting up spam filtering and backups for you.' ) }
					<br />
					{ translate( "You're now ready to finish the rest of the checklist." ) }
				</p>
				<Button primary href={ this.getMyPlanRoute() }>
					{ translate( 'Continue' ) }
				</Button>
			</Fragment>
		);
	}

	render() {
		const { progressComplete } = this.props;

		return (
			<Fragment>
				<JetpackProductInstall />

				{ progressComplete !== null && (
					<Card className="current-plan-thank-you-card__main">
						<div className="current-plan-thank-you-card__content">
							{ progressComplete === 100 ? this.renderSuccess() : this.renderSetup() }
						</div>
					</Card>
				) }
			</Fragment>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );

	return {
		progressComplete: getJetpackProductInstallProgress( state, siteId ),
		siteId,
		siteSlug: getSelectedSiteSlug( state ),
	};
} )( localize( CurrentPlanThankYouCard ) );
