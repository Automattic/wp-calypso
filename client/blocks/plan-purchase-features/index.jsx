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
	CustomDomainFeature
} from './features-list';
import { getPlansBySite } from 'state/sites/plans/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import { isPremium } from 'lib/products-values';
import { isEnabled } from 'config';
import paths from 'lib/paths';
import { isWordadsInstantActivationEligible } from 'lib/ads/utils';

class PlanPurchaseFeatures extends Component {
	static propTypes = {
		plan: PropTypes
			.oneOf( [ PLAN_FREE, PLAN_PERSONAL, PLAN_PREMIUM, PLAN_BUSINESS ] )
			.isRequired
	};

	getBusinessFeatures() {
		const { selectedSite } = this.props;

		return [
			<FindNewThemeFeature selectedSite={ selectedSite } key="findNewThemeFeature" />
		];
	}

	getPremiumFeatures() {
		const {
			selectedSite,
			sitePlans
		} = this.props;

		const plan = find( sitePlans.data, isPremium ),
			adminUrl = selectedSite.URL + '/wp-admin/',
			customizerInAdmin = adminUrl + 'customize.php?return=' + encodeURIComponent( window.location.href ),
			isCustomizeEnabled = isEnabled( 'manage/customize' ),
			customizeLink = isCustomizeEnabled ? '/customize/' + selectedSite.slug : customizerInAdmin;

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
				customizeLink={ customizeLink }
				isCustomizeEnabled={ isCustomizeEnabled }
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
