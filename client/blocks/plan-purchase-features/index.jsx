/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import {
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	PLAN_BUSINESS
} from 'lib/plans/constants';
import {
	FindNewThemeFeature,
	AdvertisingRemovedFeature,
	GoogleVouchersFeature,
	CustomizeThemeFeature,
	VideoAudioPostsFeature,
	MonetizeSiteFeature,
	CustomDomainFeature,
	GoogleAnalyticsStatsFeature
} from './features-list';
import { getPlansBySite } from 'state/sites/plans/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import {
	isPremium,
	isBusiness
} from 'lib/products-values';
import { isEnabled } from 'config';
import paths from 'lib/paths';
import { isWordadsInstantActivationEligible } from 'lib/ads/utils';

class PlanPurchaseFeatures extends Component {
	static propTypes = {
		plan: PropTypes
			.oneOf( [ PLAN_FREE, PLAN_PERSONAL, PLAN_PREMIUM, PLAN_BUSINESS ] )
			.isRequired
	};

	isCustomizeEnabled() {
		return isEnabled( 'manage/customize' );
	}

	getCustomizeLink() {
		const { selectedSite } = this.props;

		const adminUrl = selectedSite.URL + '/wp-admin/',
			customizerInAdmin = adminUrl + 'customize.php?return=' + encodeURIComponent( window.location.href );

		return this.isCustomizeEnabled() ? '/customize/' + selectedSite.slug : customizerInAdmin;
	}

	getBusinessFeatures() {
		const {
			selectedSite,
			sitePlans
		} = this.props;

		const plan = find( sitePlans.data, isBusiness );

		return [
			<CustomDomainFeature
				selectedSite={ selectedSite }
				hasDomainCredit={ plan && plan.hasDomainCredit }
				key="customDomainFeature"
			/>,
			<FindNewThemeFeature
				selectedSite={ selectedSite }
				key="findNewThemeFeature"
			/>,
			<GoogleAnalyticsStatsFeature
				selectedSite={ selectedSite }
				key="googleAnalyticsStatsFeature"
			/>,
			<AdvertisingRemovedFeature
				isBusinessPlan
				key="advertisingRemovedFeature"
			/>,
			<GoogleVouchersFeature
				selectedSite={ selectedSite }
				key="googleVouchersFeature"
			/>,
			<CustomizeThemeFeature
				customizeLink={ this.getCustomizeLink() }
				isCustomizeEnabled={ this.isCustomizeEnabled() }
				key="customizeThemeFeature"
			/>,
			<VideoAudioPostsFeature
				paths={ paths }
				selectedSite={ selectedSite }
				key="videoAudioPostsFeature"
			/>,
			isWordadsInstantActivationEligible( selectedSite )
				? <MonetizeSiteFeature
					selectedSite={ selectedSite }
					key="monetizeSiteFeature"
				/>
				: null
		];
	}

	getPremiumFeatures() {
		const {
			selectedSite,
			sitePlans
		} = this.props;

		const plan = find( sitePlans.data, isPremium );

		return [
			<CustomDomainFeature
				selectedSite={ selectedSite }
				hasDomainCredit={ plan && plan.hasDomainCredit }
				key="customDomainFeature"
			/>,
			<AdvertisingRemovedFeature
				isBusinessPlan={ false }
				key="advertisingRemovedFeature"
			/>,
			<GoogleVouchersFeature
				selectedSite={ selectedSite }
				key="googleVouchersFeature"
			/>,
			<CustomizeThemeFeature
				customizeLink={ this.getCustomizeLink() }
				isCustomizeEnabled={ this.isCustomizeEnabled() }
				key="customizeThemeFeature"
			/>,
			<VideoAudioPostsFeature
				paths={ paths }
				selectedSite={ selectedSite }
				key="videoAudioPostsFeature"
			/>,
			isWordadsInstantActivationEligible( selectedSite )
				? <MonetizeSiteFeature
					selectedSite={ selectedSite }
					key="monetizeSiteFeature"
				/>
				: null
		];
	}

	getPlanPurchaseFeatures() {
		const { plan } = this.props;

		switch ( plan ) {
			case PLAN_BUSINESS:
				return this.getBusinessFeatures();
			case PLAN_PREMIUM:
				return this.getPremiumFeatures();
			default:
				return null;
		}
	}

	render() {
		return (
			<div className="plan-purchase-features">
				{ this.getPlanPurchaseFeatures() }
			</div>
		);
	}
}

export default connect( ( state ) => {
	return {
		selectedSite: getSelectedSite( state ),
		sitePlans: getPlansBySite( state, getSelectedSite( state ) )
	};
} )( localize( PlanPurchaseFeatures ) );
