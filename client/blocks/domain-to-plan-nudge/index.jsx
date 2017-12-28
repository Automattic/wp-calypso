/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Banner from 'client/components/banner';
import { getSelectedSiteId } from 'client/state/ui/selectors';
import { getSite } from 'client/state/sites/selectors';
import { PLAN_PERSONAL, FEATURE_NO_ADS } from 'client/lib/plans/constants';
import { getPlan } from 'client/lib/plans';
import { getCurrentUserCurrencyCode } from 'client/state/current-user/selectors';
import {
	getSitePlanRawPrice,
	getPlanDiscountedRawPrice,
	getPlanRawDiscount,
	getPlansBySiteId,
} from 'client/state/sites/plans/selectors';
import QuerySitePlans from 'client/components/data/query-site-plans';
import formatCurrency from 'client/lib/format-currency';
import { isEligibleForDomainToPaidPlanUpsell } from 'client/state/selectors';

class DomainToPlanNudge extends Component {
	static propTypes = {
		isEligible: PropTypes.bool,
		discountedRawPrice: PropTypes.number,
		productId: PropTypes.number,
		productSlug: PropTypes.string,
		rawDiscount: PropTypes.number,
		rawPrice: PropTypes.number,
		site: PropTypes.object,
		siteId: PropTypes.number,
		sitePlans: PropTypes.object,
		translate: PropTypes.func,
		userCurrency: PropTypes.string,
		size: PropTypes.string,
	};

	isSiteEligible() {
		const { isEligible, rawPrice, sitePlans } = this.props;

		return (
			sitePlans.hasLoadedFromServer &&
			rawPrice && //plans info has loaded
			isEligible
		); // meets criteria for nudge
	}

	renderDomainToPlanNudge() {
		const { siteId, translate, discountedRawPrice, rawPrice, userCurrency } = this.props;

		const prices = discountedRawPrice ? [ rawPrice, discountedRawPrice ] : null;
		return (
			<Banner
				callToAction={ translate( 'Upgrade for %s', {
					args: formatCurrency( discountedRawPrice || rawPrice, userCurrency ),
					comment: '%s will be replaced by a formatted price, i.e $9.99',
				} ) }
				event="domain_to_personal_nudge" //actually cta_name
				dismissPreferenceName="domain-to-plan-nudge"
				feature={ FEATURE_NO_ADS }
				href={ `/checkout/${ siteId }/personal` }
				list={ [
					translate( 'Remove WordPress.com Ads' ),
					translate( 'Email & Live Chat Support' ),
					translate( 'Use with your Current Custom Domain' ),
				] }
				plan={ PLAN_PERSONAL }
				price={ prices }
				title={ translate( 'Upgrade to a Personal Plan and Save!' ) }
			/>
		);
	}

	render() {
		const { siteId } = this.props;

		return (
			<div className="domain-to-plan-nudge">
				<QuerySitePlans siteId={ siteId } />
				{ this.isSiteEligible() && this.renderDomainToPlanNudge() }
			</div>
		);
	}
}

export default connect( ( state, props ) => {
	const siteId = props.siteId || getSelectedSiteId( state ),
		productSlug = PLAN_PERSONAL,
		productId = getPlan( PLAN_PERSONAL ).getProductId();

	return {
		isEligible: isEligibleForDomainToPaidPlanUpsell( state, siteId ),
		discountedRawPrice: getPlanDiscountedRawPrice( state, siteId, productSlug ),
		productId,
		productSlug,
		rawDiscount: getPlanRawDiscount( state, siteId, productSlug ) || 0,
		rawPrice: getSitePlanRawPrice( state, siteId, productSlug ),
		site: getSite( state, siteId ),
		siteId,
		sitePlans: getPlansBySiteId( state, siteId ),
		userCurrency: getCurrentUserCurrencyCode( state ), //populated by either plans endpoint
	};
} )( localize( DomainToPlanNudge ) );
