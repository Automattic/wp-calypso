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
	PLAN_BUSINESS,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_BUSINESS_MONTHLY
} from 'lib/plans/constants';
import {
	FindNewThemeFeature,
	AdvertisingRemovedFeature,
	GoogleVouchersFeature,
	CustomizeThemeFeature,
	VideoAudioPostsFeature,
	MonetizeSiteFeature,
	CustomDomainFeature,
	GoogleAnalyticsStatsFeature,
	JetpackFeatures,
	HapinessSupportFeature,
	CurrentPlanHeaderFeature
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
import userFactory from 'lib/user';
import analytics from 'lib/analytics';
import utils from 'lib/site/utils';

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
			sitePlans,
			translate
		} = this.props;

		const plan = find( sitePlans.data, isBusiness ),
			hasLoadedFromServer = sitePlans.hasLoadedFromServer;

		return [
			<HapinessSupportFeature
				selectedSite={ selectedSite }
				key="hapinessSupportFeature"
			/>,
			<CurrentPlanHeaderFeature
				selectedSite={ selectedSite }
				key="currentPlanHeaderFeature"
				hasLoadedFromServer={ hasLoadedFromServer }
				title={ translate( 'Your site is on a Business plan' ) }
				tagLine={ translate( 'Learn more about everything included with Business and take advantage of' +
					' its professional features.' ) }
			/>,
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

	getPersonalFeatures() {
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
			/>
		];
	}

	getJetpackFeatures() {
		const {	selectedSite } = this.props;

		return [
			<JetpackFeatures
				selectedSite={ selectedSite }
				user={ userFactory() }
				analytics={ analytics }
				utils={ utils }
				isPluginsSetupEnabled={ isEnabled( 'manage/plugins/setup' ) }
				key="jetpackFeatures"
			/>
		];
	}

	getPlanPurchaseFeatures() {
		const { plan } = this.props;

		switch ( plan ) {
			case PLAN_BUSINESS:
				return this.getBusinessFeatures();
			case PLAN_PREMIUM:
				return this.getPremiumFeatures();
			case PLAN_PERSONAL:
				return this.getPersonalFeatures();
			case PLAN_JETPACK_FREE:
			case PLAN_JETPACK_PREMIUM:
			case PLAN_JETPACK_BUSINESS:
			case PLAN_JETPACK_PREMIUM_MONTHLY:
			case PLAN_JETPACK_BUSINESS_MONTHLY:
				return this.getJetpackFeatures();
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
