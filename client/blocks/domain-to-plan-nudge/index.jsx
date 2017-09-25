/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Banner from 'components/banner';
import QuerySitePlans from 'components/data/query-site-plans';
import formatCurrency from 'lib/format-currency';
import { getPlan } from 'lib/plans';
import { PLAN_PERSONAL, FEATURE_NO_ADS } from 'lib/plans/constants';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { isEligibleForDomainToPaidPlanUpsell } from 'state/selectors';
import { getSitePlanRawPrice, getPlanDiscountedRawPrice, getPlanRawDiscount, getPlansBySiteId } from 'state/sites/plans/selectors';
import { getSite } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

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
		size: PropTypes.string
	};

	isSiteEligible() {
		const {
			isEligible,
			rawPrice,
			sitePlans,
		} = this.props;

		return sitePlans.hasLoadedFromServer &&
			rawPrice &&       //plans info has loaded
			isEligible;      // meets criteria for nudge
	}

	renderDomainToPlanNudge() {
		const {
			siteId,
			translate,
			discountedRawPrice,
			rawPrice,
			userCurrency
		} = this.props;

		const prices = discountedRawPrice ? [ rawPrice, discountedRawPrice ] : null;
		return (
			<Banner
				callToAction={
					translate( 'Upgrade for %s', {
						args: formatCurrency( discountedRawPrice || rawPrice, userCurrency ),
						comment: '%s will be replaced by a formatted price, i.e $9.99'
					} )
				}
				event="domain_to_personal_nudge" //actually cta_name
				dismissPreferenceName="domain-to-plan-nudge"
				feature={ FEATURE_NO_ADS }
				href={ `/checkout/${ siteId }/personal` }
				list={
					[
						translate( 'Remove WordPress.com Ads' ),
						translate( 'Email & Live Chat Support' ),
						translate( 'Use with your Current Custom Domain' )
					]
				}
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

export default connect(
	( state, props ) => {
		const siteId = props.siteId || getSelectedSiteId( state ),
			productSlug = PLAN_PERSONAL,
			productId = getPlan( PLAN_PERSONAL ).getProductId();

		return {
			isEligible: isEligibleForDomainToPaidPlanUpsell( state, siteId, ),
			discountedRawPrice: getPlanDiscountedRawPrice( state, siteId, productSlug ),
			productId,
			productSlug,
			rawDiscount: getPlanRawDiscount( state, siteId, productSlug ) || 0,
			rawPrice: getSitePlanRawPrice( state, siteId, productSlug ),
			site: getSite( state, siteId ),
			siteId,
			sitePlans: getPlansBySiteId( state, siteId ),
			userCurrency: getCurrentUserCurrencyCode( state ) //populated by either plans endpoint
		};
	}
)( localize( DomainToPlanNudge ) );
