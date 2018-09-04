/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { get, isFinite, noop } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import getCurrentPlanPurchaseId from 'state/selectors/get-current-plan-purchase-id';
import ProgressBar from 'components/progress-bar';
import QuerySitePurchases from 'components/data/query-site-purchases';
import { getByPurchaseId } from 'state/purchases/selectors';
import { getPlan } from 'lib/plans';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSitePlanSlug } from 'state/sites/selectors';

export class PlanSetupHeader extends Component {
	static propTypes = {
		progressComplete: PropTypes.number,
		progressTotal: PropTypes.number,
	};

	render() {
		const { moment, purchaseExpiryDate, planName, siteId, translate } = this.props;
		const duration = purchaseExpiryDate
			? moment.duration( moment().diff( purchaseExpiryDate ) ).humanize()
			: null;
		return (
			<>
				<QuerySitePurchases siteId={ siteId } />
				{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
				<Card className="thank-you-header">
					<img
						className="thank-you-header__illustration"
						alt=""
						aria-hidden="true"
						src="/calypso/images/illustrations/fireworks.svg"
					/>
					<h1 className="thank-you-header__title">
						{ translate( 'Thank you for your purchase!' ) }
					</h1>
					<p>
						{ duration && planName
							? translate(
									'Your website is on a %(planName)s plan for %(duration)s. Let’s walk through a short checklist of essential security features for safeguarding your website.',
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
					{ /* can be 0 */ isFinite( this.props.progressComplete ) &&
						/* shouldn't be 0 */ this.props.progressTotal && (
							<ProgressBar
								isPulsing
								total={ this.props.progressTotal }
								value={ this.props.progressComplete }
							/>
						) }
					<div>
						<a href={ /* @TODO (sirreal) fix this */ document.location.pathname }>
							{ translate( 'Skip setup. I’ll do this later.' ) }
						</a>
					</div>
				</Card>
			</>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );
	const planSlug = getSitePlanSlug( state, siteId );
	return {
		planName: get( getPlan( planSlug ), [ 'getTitle' ], noop )(),
		purchaseExpiryDate: get( getByPurchaseId( state, getCurrentPlanPurchaseId( state, siteId ) ), [
			'expiryDate',
		] ),
		siteId,
	};
} )( localize( PlanSetupHeader ) );
