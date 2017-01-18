/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Banner from 'components/banner';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSite, isCurrentSitePlan } from 'state/sites/selectors';
import { PLAN_FREE, PLAN_PERSONAL, FEATURE_NO_ADS } from 'lib/plans/constants';
import { getPlan } from 'lib/plans';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import {
	getSitePlanRawPrice,
	getPlanDiscountedRawPrice,
	getPlanRawDiscount,
	getPlansBySiteId
} from 'state/sites/plans/selectors';
import QuerySitePlans from 'components/data/query-site-plans';
import formatCurrency from 'lib/format-currency';
import { canCurrentUser } from 'state/selectors';

class DomainToPlanNudge extends Component {

	static propTypes = {
		discountedRawPrice: PropTypes.number,
		hasFreePlan: PropTypes.bool,
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
			canManage,
			hasFreePlan,
			rawPrice,
			site,
			sitePlans,
		} = this.props;

		return sitePlans.hasLoadedFromServer &&
			canManage &&      //can manage site
			rawPrice &&       //plans info has loaded
			site &&           //site exists
			site.wpcom_url && //has a mapped domain
			hasFreePlan;      //has a free wpcom plan
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
			canManage: canCurrentUser( state, siteId, 'manage_options' ),
			discountedRawPrice: getPlanDiscountedRawPrice( state, siteId, productSlug ),
			hasFreePlan: isCurrentSitePlan(
				state,
				siteId,
				getPlan( PLAN_FREE ).getProductId()
			),
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
