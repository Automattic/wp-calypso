/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { getRawSite } from 'state/sites/selectors';
import { getCurrentPlan } from 'state/sites/plans/selectors';
import QuerySites from 'components/data/query-sites';
import QuerySitePlans from 'components/data/query-site-plans';
import { getPlan } from 'lib/plans';
import formatCurrency from 'lib/format-currency';
import ThankYouCard from 'components/thank-you-card';

const PlanThankYouCard = ( {
	plan,
	translate,
	siteId,
	siteURL,
} ) => {
	const name = plan && translate( '%(planName)s Plan', {
		args: { planName: getPlan( plan.productSlug ).getTitle() }
	} );
	const price = plan && formatCurrency( plan.rawPrice, plan.currencyCode );

	return (
		<ThankYouCard name={ name } price={ price }>
			<QuerySites siteId={ siteId } />
			<QuerySitePlans siteId={ siteId } />

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
		</ThankYouCard>
	);
};

PlanThankYouCard.propTypes = {
	plan: PropTypes.object,
	siteId: PropTypes.number.isRequired,
	siteUrl: PropTypes.string,
	translate: PropTypes.func.isRequired,
};

export default connect( ( state, ownProps ) => {
	const site = getRawSite( state, ownProps.siteId );
	const plan = getCurrentPlan( state, ownProps.siteId );

	return {
		plan,
		siteURL: site && site.URL
	};
} )( localize( PlanThankYouCard ) );
