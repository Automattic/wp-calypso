/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { get, invoke } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import getCurrentPlanPurchase from 'state/selectors/get-current-plan-purchase';
import JetpackProductInstall from 'my-sites/plans/current-plan/jetpack-product-install';
import QuerySitePurchases from 'components/data/query-site-purchases';
import { getPlan } from 'lib/plans';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSitePlanSlug } from 'state/sites/selectors';

export class CurrentPlanThankYouCard extends Component {
	render() {
		const { moment, planName, purchaseExpiryDate, siteId, translate } = this.props;
		const duration = purchaseExpiryDate
			? moment.duration( moment().diff( purchaseExpiryDate ) ).humanize()
			: null;
		return (
			<Card className="current-plan-thank-you-card">
				<QuerySitePurchases siteId={ siteId } />
				<div className="current-plan-thank-you-card__content">
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
					<JetpackProductInstall />
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
		purchaseExpiryDate: get( getCurrentPlanPurchase( state, siteId ), [ 'expiryDate' ] ),
		siteId,
	};
} )( localize( CurrentPlanThankYouCard ) );
