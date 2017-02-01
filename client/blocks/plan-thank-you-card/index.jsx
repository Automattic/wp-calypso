/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import classnames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import { getRawSite } from 'state/sites/selectors';
import { getCurrentPlan } from 'state/sites/plans/selectors';
import QuerySites from 'components/data/query-sites';
import QuerySitePlans from 'components/data/query-site-plans';
import { getPlan } from 'lib/plans';
import formatCurrency from 'lib/format-currency';

class PlanThankYouCard extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired
	};

	render() {
		const {
			plan,
			translate,
			siteId,
			siteURL,
		} = this.props;
		// Non standard gridicon sizes are used here because we use them as background pattern with various sizes and rotation
		/* eslint-disable wpcalypso/jsx-gridicon-size */
		return (
			<div className="plan-thank-you-card">
				<QuerySites siteId={ siteId } />
				<QuerySitePlans siteId={ siteId } />
				<div className="plan-thank-you-card__header">
					<Gridicon className="plan-thank-you-card__main-icon" icon="checkmark-circle" size={ 140 } />
					{ ! plan
						? <div>
								<div className="plan-thank-you-card__plan-name is-placeholder"></div>
								<div className="plan-thank-you-card__plan-price is-placeholder"></div>
							</div>
						: <div>
								<div className="plan-thank-you-card__plan-name">
								{ translate( '%(planName)s Plan', {
									args: { planName: getPlan( plan.productSlug ).getTitle() }
								} ) }
								</div>
								<div className="plan-thank-you-card__plan-price">
									{ formatCurrency( plan.rawPrice, plan.currencyCode ) }
								</div>
							</div>
					}
					<div className="plan-thank-you-card__background-icons">
						<Gridicon icon="audio" size={ 52 } />
						<Gridicon icon="audio" size={ 20 } />
						<Gridicon icon="heart" size={ 52 } />
						<Gridicon icon="heart" size={ 41 } />
						<Gridicon icon="star" size={ 26 } />
						<Gridicon icon="status" size={ 52 } />
						<Gridicon icon="audio" size={ 38 } />
						<Gridicon icon="status" size={ 28 } />
						<Gridicon icon="status" size={ 65 } />
						<Gridicon icon="star" size={ 57 } />
						<Gridicon icon="star" size={ 33 } />
						<Gridicon icon="star" size={ 45 } />
					</div>
				</div>
				<div className="plan-thank-you-card__body">
					<div className="plan-thank-you-card__heading">
						{ translate( 'Thank you for your purchase!' ) }
					</div>
					<div className="plan-thank-you-card__description">
						{ translate( "Now that we've taken care of the plan, it's time to see your new site." ) }
					</div>
					<a
						className={ classnames( 'plan-thank-you-card__button', { 'is-placeholder': ! siteURL } ) }
						href={ siteURL }>
						{ translate( 'Visit Your Site' ) }
					</a>
				</div>
			</div>
		);
		/* eslint-enable wpcalypso/jsx-gridicon-size */
	}
}

export default connect( ( state, ownProps ) => {
	const site = getRawSite( state, ownProps.siteId );
	const plan = getCurrentPlan( state, ownProps.siteId );

	return {
		plan,
		siteURL: site && site.URL
	};
} )( localize( PlanThankYouCard ) );
