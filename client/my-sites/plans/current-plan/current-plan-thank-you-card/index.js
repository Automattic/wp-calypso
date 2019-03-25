/** @format */
/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { get, invoke } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import getCurrentPlanPurchase from 'state/selectors/get-current-plan-purchase';
import getJetpackProductInstallProgress from 'state/selectors/get-jetpack-product-install-progress';
import JetpackProductInstall from 'my-sites/plans/current-plan/jetpack-product-install';
import ProgressBar from 'components/progress-bar';
import QuerySitePurchases from 'components/data/query-site-purchases';
import { getPlan } from 'lib/plans';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSitePlanSlug } from 'state/sites/selectors';

export class CurrentPlanThankYouCard extends Component {
	renderSetup() {
		const { moment, planName, progressComplete, purchaseExpiryDate, translate } = this.props;
		const duration = purchaseExpiryDate
			? moment.duration( moment().diff( purchaseExpiryDate ) ).humanize()
			: null;

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
				<p>
					{ duration && planName
						? translate(
								'Your website is on a %(planName)s plan for %(duration)s. That means it has lots of useful security tools — let’s walk through a short checklist of the essentials so Jetpack can start monitoring things for you.',
								{
									args: { duration, planName },
								}
						  )
						: ' ' /* &nbsp; maintain some space */ }
				</p>
				<p>
					{ translate(
						'We’ve taken the liberty of starting the first two items, since they’re key to your site’s safety: we’re configuring spam filtering and backups for you now. Once that’s done, we can work through the rest of the checklist.'
					) }
				</p>

				<ProgressBar isPulsing total={ 100 } value={ progressComplete || 0 } />

				<p>
					<a href={ /* @TODO (sirreal) fix this */ document.location.pathname }>
						{ translate( 'Skip setup. I’ll do this later.' ) }
					</a>
				</p>
			</Fragment>
		);
	}

	renderSuccess() {
		const { translate } = this.props;

		return (
			<p>
				{ translate( 'We’ve finished setting up spam filtering and backups for you.' ) }
				<br />
				{ translate( "You're now ready to finish the rest of the checklist." ) }
			</p>
		);
	}

	render() {
		const { progressComplete, siteId } = this.props;

		return (
			<Card className="current-plan-thank-you-card">
				<QuerySitePurchases siteId={ siteId } />
				<JetpackProductInstall />

				<div className="current-plan-thank-you-card__content">
					{ progressComplete === 100 ? this.renderSuccess() : this.renderSetup() }
				</div>
			</Card>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );
	const planSlug = getSitePlanSlug( state, siteId );

	return {
		planName: invoke( getPlan( planSlug ), [ 'getTitle' ] ),
		progressComplete: getJetpackProductInstallProgress( state, siteId ),
		purchaseExpiryDate: get( getCurrentPlanPurchase( state, siteId ), [ 'expiryDate' ] ),
		siteId,
	};
} )( localize( CurrentPlanThankYouCard ) );
