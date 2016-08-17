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
import FindNewTheme from './find-new-theme';
import AdvertisingRemoved from './advertising-removed';
import GoogleVouchers from './google-vouchers';
import CustomizeTheme from './customize-theme';
import VideoAudioPosts from './video-audio-posts';
import MonetizeSite from './monetize-site';
import CustomDomain from './custom-domain';
import GoogleAnalyticsStats from './google-analytics-stats';
import JetpackFeatures from './jetpack-features';
import HappinessSupport from './happiness-support';
import CurrentPlanHeader from './current-plan-header';
import { getPlansBySite } from 'state/sites/plans/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import {
	isPremium,
	isBusiness
} from 'lib/products-values';
import { isWordadsInstantActivationEligible } from 'lib/ads/utils';

class PlanPurchaseFeatures extends Component {
	static propTypes = {
		plan: PropTypes
			.oneOf( [ PLAN_FREE, PLAN_PERSONAL, PLAN_PREMIUM, PLAN_BUSINESS ] )
			.isRequired,
		selectedSite: PropTypes.object
	};

	getBusinessFeatures() {
		const {
			selectedSite,
			sitePlans,
			translate
		} = this.props;

		const plan = find( sitePlans.data, isBusiness ),
			hasLoadedFromServer = sitePlans.hasLoadedFromServer;

		return [
			<HappinessSupport
				selectedSite={ selectedSite }
				key="hapinessSupportFeature"
			/>,
			<CurrentPlanHeader
				selectedSite={ selectedSite }
				key="currentPlanHeaderFeature"
				hasLoadedFromServer={ hasLoadedFromServer }
				title={ translate( 'Your site is on a Business plan' ) }
				tagLine={ translate( 'Learn more about everything included with Business and take advantage of' +
					' its professional features.' ) }
			/>,
			<CustomDomain
				selectedSite={ selectedSite }
				hasDomainCredit={ plan && plan.hasDomainCredit }
				key="customDomainFeature"
			/>,
			<FindNewTheme
				selectedSite={ selectedSite }
				key="findNewThemeFeature"
			/>,
			<GoogleAnalyticsStats
				selectedSite={ selectedSite }
				key="googleAnalyticsStatsFeature"
			/>,
			<AdvertisingRemoved
				isBusinessPlan
				key="advertisingRemovedFeature"
			/>,
			<GoogleVouchers
				selectedSite={ selectedSite }
				key="googleVouchersFeature"
			/>,
			<CustomizeTheme
				selectedSite={ selectedSite }
				key="customizeThemeFeature"
			/>,
			<VideoAudioPosts
				selectedSite={ selectedSite }
				key="videoAudioPostsFeature"
			/>,
			isWordadsInstantActivationEligible( selectedSite )
				? <MonetizeSite
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
			<CustomDomain
				selectedSite={ selectedSite }
				hasDomainCredit={ plan && plan.hasDomainCredit }
				key="customDomainFeature"
			/>,
			<AdvertisingRemoved
				isBusinessPlan={ false }
				key="advertisingRemovedFeature"
			/>,
			<GoogleVouchers
				selectedSite={ selectedSite }
				key="googleVouchersFeature"
			/>,
			<CustomizeTheme
				selectedSite={ selectedSite }
				key="customizeThemeFeature"
			/>,
			<VideoAudioPosts
				selectedSite={ selectedSite }
				key="videoAudioPostsFeature"
			/>,
			isWordadsInstantActivationEligible( selectedSite )
				? <MonetizeSite
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
			<CustomDomain
				selectedSite={ selectedSite }
				hasDomainCredit={ plan && plan.hasDomainCredit }
				key="customDomainFeature"
			/>,
			<AdvertisingRemoved
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

export default connect( ( state, ownProps ) => {
	let selectedSite = getSelectedSite( state );

	if ( ownProps.selectedSite ) {
		selectedSite = ownProps.selectedSite;
	}

	return {
		selectedSite,
		sitePlans: getPlansBySite( state, getSelectedSite( state ) )
	};
} )( localize( PlanPurchaseFeatures ) );
