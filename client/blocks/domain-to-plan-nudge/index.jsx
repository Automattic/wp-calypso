/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import DismissibleCard from 'blocks/dismissible-card';
import { recordTracksEvent } from 'state/analytics/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSite, isCurrentSitePlan } from 'state/sites/selectors';
import { PLAN_FREE, PLAN_PERSONAL } from 'lib/plans/constants';
import { getPlan } from 'lib/plans';
import PlanPrice from 'my-sites/plan-price';
import PlanIcon from 'components/plans/plan-icon';
import Gridicon from 'components/gridicon';
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
import TrackComponentView from 'lib/analytics/track-component-view';
import UpgradeNudge from 'my-sites/upgrade-nudge';

class DomainToPlanNudge extends Component {

	static propTypes = {
		discountedRawPrice: PropTypes.number,
		hasFreePlan: PropTypes.bool,
		productId: PropTypes.number,
		productSlug: PropTypes.string,
		rawDiscount: PropTypes.number,
		rawPrice: PropTypes.number,
		recordTracksEvent: PropTypes.func,
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

	personalCheckout = () => {
		const { siteId } = this.props;

		this.props.recordTracksEvent( 'calypso_upgrade_nudge_cta_click', {
			cta_name: 'domain_to_personal_nudge',
			cta_feature: 'no-adverts',
			cta_size: 'banner'
		} );

		page( `/checkout/${ siteId }/personal` );
	};

	renderRegular() {
		const { siteId, translate } = this.props;
		return (
			<UpgradeNudge
				title={ translate( 'Upgrade to a Personal Plan and save!' ) }
				message={ translate( 'Buy our Personal Plan and remove WordPress.com Ads from your site.' ) }
				feature={ 'no-adverts' }
				event="domain_to_personal_nudge" //actually cta_name
				href={ `/checkout/${ siteId }/personal` }
			/>
		);
	}

	renderBanner() {
		const {
			discountedRawPrice,
			productSlug,
			rawDiscount,
			rawPrice,
			translate,
			userCurrency
		} = this.props;

		return (
			<DismissibleCard
				className="domain-to-plan-nudge__card"
				preferenceName="domain-to-plan-nudge"
			>
			<TrackComponentView
				eventName={ 'calypso_upgrade_nudge_impression' }
				eventProperties={ {
					cta_name: 'domain_to_personal_nudge',
					cta_feature: 'no-adverts',
					cta_size: 'banner'
				} } />
				<div className="domain-to-plan-nudge__header">
					<div className="domain-to-plan-nudge__header-icon">
						<PlanIcon plan={ productSlug } />
					</div>
					<div className="domain-to-plan-nudge__header-copy">
						<h3 className="domain-to-plan-nudge__header-title">
							{ translate( 'Upgrade to a Personal Plan and Save!' ) }
						</h3>
						<ul className="domain-to-plan-nudge__header-features">
							<li>
								<div className="domain-to-plan-nudge__header-features-item">
									<Gridicon
										className="domain-to-plan-nudge__header-features-item-checkmark"
										icon="checkmark"
										size={ 24 }
									/>
									{ translate( 'Remove all WordPress.com advertising from your website' ) }
								</div>
							</li>
							<li>
								<div className="domain-to-plan-nudge__header-features-item">
									<Gridicon
										className="domain-to-plan-nudge__header-features-item-checkmark"
										icon="checkmark"
										size={ 24 }
									/>
									{ translate( 'Get high quality live chat and priority email support' ) }
								</div>
							</li>
							<li>
								<div className="domain-to-plan-nudge__header-features-item">
									<Gridicon
										className="domain-to-plan-nudge__header-features-item-checkmark"
										icon="checkmark"
										size={ 24 }
									/>
									{ translate( 'Bundled with your domain for the best value!' ) }
								</div>
							</li>
						</ul>
					</div>
				</div>
				<div className="domain-to-plan-nudge__actions-group">
					<div className="domain-to-plan-nudge__plan-price-group">
						<div
							className="domain-to-plan-nudge__discount-value">
							{
								translate( 'SAVE %(discount)s', {
									args: {
										discount: formatCurrency( rawDiscount, userCurrency )
									}
								} )
							}
						</div>
						<PlanPrice
							rawPrice={ rawPrice }
							currencyCode={ userCurrency }
							original
						/>
						<PlanPrice
							rawPrice={ discountedRawPrice || rawPrice }
							currencyCode={ userCurrency }
							discounted
						/>

						<div className="domain-to-plan-nudge__plan-price-timeframe">
							{ translate( 'for a one year subscription' ) }
						</div>
					</div>
					<div className="domain-to-plan-nudge__upgrade-group">
						<Button
							className="domain-to-plan-nudge__upgrade-button"
							onClick={ this.personalCheckout }
							primary
						>
							{
								translate( 'Upgrade Now for %s', {
									args: formatCurrency( discountedRawPrice || rawPrice, userCurrency ),
									comment: '%s will be replaced by a formatted price, i.e $9.9'
								} )
							}
						</Button>
					</div>
				</div>
			</DismissibleCard>
		);
	}

	renderDomainToPlanNudge() {
		const { size } = this.props;
		if ( size === 'banner' ) {
			this.renderBanner();
		}
		return this.renderRegular();
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
	},
	{
		recordTracksEvent
	}
)( localize( DomainToPlanNudge ) );
