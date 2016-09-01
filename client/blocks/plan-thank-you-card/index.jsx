/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import { getSite } from 'state/sites/selectors';
import { getCurrentPlan } from 'state/sites/plans/selectors';
import QuerySites from 'components/data/query-sites';
import QuerySitePlans from 'components/data/query-site-plans';
import { plansList } from 'lib/plans/constants';

class PlanThankYouCard extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired
	};

	render() {
		const {
			plan,
			site,
			translate,
			siteId
		} = this.props;
		// Non standard gridicon sizes are used here because we use them as background pattern with various sizes and rotation
		/* eslint-disable wpcalypso/jsx-gridicon-size */
		return (
			<div className="plan-thank-you-card">
				<QuerySites siteId={ siteId } />
				<QuerySitePlans siteId={ siteId } />
				<div className="plan-thank-you-card__header">
					<Gridicon className="plan-thank-you-card__main-icon" icon="checkmark-circle" size={ 140 } />
					{ ! site
						? <div className="plan-thank-you-card__plan-name is-placeholder"></div>
						: <div className="plan-thank-you-card__plan-name">
								{ translate( '%(planName)s Plan', {
									args: { planName: plansList[ site.plan.product_slug ].getTitle() }
								} ) }
							</div>
					}
					{ ! plan
						? <div className="plan-thank-you-card__plan-price is-placeholder"></div>
						: <div className="plan-thank-you-card__plan-price">{ plan.formattedPrice }</div>
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
						{ translate( 'Now that we’ve taken care of the plan, its time to see your new site.' ) }
					</div>
					<a
						className="plan-thank-you-card__button"
						href={ site.URL }>
						{ translate( 'Visit your site' ) }
					</a>
				</div>
			</div>
		);
		/* eslint-enable wpcalypso/jsx-gridicon-size */
	}
}

export default connect( ( state, ownProps ) => {
	const site = getSite( state, ownProps.siteId );
	const plan = getCurrentPlan( state, ownProps.siteId );

	return {
		site,
		plan,
	};
} )( localize( PlanThankYouCard ) );
