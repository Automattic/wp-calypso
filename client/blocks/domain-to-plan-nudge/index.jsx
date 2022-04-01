import {
	getPlan,
	PLAN_WPCOM_PRO,
	PLAN_PERSONAL,
	FEATURE_NO_ADS,
} from '@automattic/calypso-products';
import formatCurrency from '@automattic/format-currency';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import isEligibleForDomainToPaidPlanUpsell from 'calypso/state/selectors/is-eligible-for-domain-to-paid-plan-upsell';
import {
	getSitePlanRawPrice,
	getPlanDiscountedRawPrice,
	getPlanRawDiscount,
	getPlansBySiteId,
} from 'calypso/state/sites/plans/selectors';
import { getSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

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
			<UpsellNudge
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
					translate( 'Access unlimited customer support via email' ),
					translate( 'Use with your Current Custom Domain' ),
				] }
				plan={ PLAN_WPCOM_PRO }
				price={ prices }
				showIcon
				title={ translate( 'Upgrade to a Pro Plan and Save!' ) }
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
	const siteId = props.siteId || getSelectedSiteId( state );
	const productSlug = PLAN_PERSONAL;
	const productId = getPlan( PLAN_PERSONAL ).getProductId();

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
