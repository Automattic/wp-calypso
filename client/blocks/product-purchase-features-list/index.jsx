/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { partial } from 'lodash';

/**
 * Internal dependencies
 */
import { getPlan } from 'lib/plans';
import {
	PLANS_LIST,
	GROUP_WPCOM,
	GROUP_JETPACK,
	TYPE_BUSINESS,
	TYPE_PREMIUM,
	TYPE_PERSONAL,
	TYPE_FREE,
} from 'lib/plans/constants';
import FindNewTheme from './find-new-theme';
import UploadPlugins from './upload-plugins';
import AdvertisingRemoved from './advertising-removed';
import GoogleVouchers from './google-vouchers';
import CustomizeTheme from './customize-theme';
import VideoAudioPosts from './video-audio-posts';
import MonetizeSite from './monetize-site';
import BusinessOnboarding from './business-onboarding';
import CustomDomain from './custom-domain';
import GoogleAnalyticsStats from './google-analytics-stats';
import HappinessSupportCard from './happiness-support-card';
import JetpackAntiSpam from './jetpack-anti-spam';
import JetpackPublicize from './jetpack-publicize';
import JetpackVideo from './jetpack-video';
import JetpackBackupSecurity from './jetpack-backup-security';
import JetpackSearch from './jetpack-search';
import JetpackReturnToDashboard from './jetpack-return-to-dashboard';
import JetpackWordPressCom from './jetpack-wordpress-com';
import { isSiteAutomatedTransfer } from 'state/selectors';
import { isEnabled } from 'config';
import { isWordadsInstantActivationEligible } from 'lib/ads/utils';
import { hasDomainCredit } from 'state/sites/plans/selectors';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { recordTracksEvent } from 'state/analytics/actions';

export class ProductPurchaseFeaturesList extends Component {
	static propTypes = {
		plan: PropTypes.oneOf( Object.keys( PLANS_LIST ) ).isRequired,
		isPlaceholder: PropTypes.bool,
	};

	static defaultProps = {
		isPlaceholder: false,
	};

	getBusinessFeatures() {
		const { isPlaceholder, plan, planHasDomainCredit, selectedSite } = this.props;
		return (
			<Fragment>
				<HappinessSupportCard
					isPlaceholder={ isPlaceholder }
					showLiveChatButton
					liveChatButtonEventName={ 'calypso_livechat_my_plan_business' }
				/>
				<CustomDomain selectedSite={ selectedSite } hasDomainCredit={ planHasDomainCredit } />
				<BusinessOnboarding
					onClick={ this.props.recordBusinessOnboardingClick }
					link={ `/me/concierge/${ selectedSite.slug }/book` }
				/>
				{ isWordadsInstantActivationEligible( selectedSite ) && (
					<MonetizeSite selectedSite={ selectedSite } />
				) }
				<JetpackSearch selectedSite={ selectedSite } />
				<GoogleVouchers selectedSite={ selectedSite } />
				<GoogleAnalyticsStats selectedSite={ selectedSite } />
				<AdvertisingRemoved isBusinessPlan />
				<CustomizeTheme selectedSite={ selectedSite } />
				<VideoAudioPosts selectedSite={ selectedSite } plan={ plan } />
				<FindNewTheme selectedSite={ selectedSite } />
				{ isEnabled( 'manage/plugins/upload' ) && <UploadPlugins selectedSite={ selectedSite } /> }
			</Fragment>
		);
	}

	getPremiumFeatures() {
		const { isPlaceholder, plan, planHasDomainCredit, selectedSite } = this.props;

		return (
			<Fragment>
				<HappinessSupportCard isPlaceholder={ isPlaceholder } />
				<CustomDomain selectedSite={ selectedSite } hasDomainCredit={ planHasDomainCredit } />
				<AdvertisingRemoved isBusinessPlan={ false } />
				<GoogleVouchers selectedSite={ selectedSite } />
				<CustomizeTheme selectedSite={ selectedSite } />
				<VideoAudioPosts selectedSite={ selectedSite } plan={ plan } />
				{ isWordadsInstantActivationEligible( selectedSite ) && (
					<MonetizeSite selectedSite={ selectedSite } />
				) }
			</Fragment>
		);
	}

	getPersonalFeatures() {
		const { isPlaceholder, selectedSite, planHasDomainCredit } = this.props;

		return (
			<Fragment>
				<HappinessSupportCard isPlaceholder={ isPlaceholder } />
				<CustomDomain selectedSite={ selectedSite } hasDomainCredit={ planHasDomainCredit } />
				<AdvertisingRemoved isBusinessPlan={ false } />
			</Fragment>
		);
	}

	getJetpackFreeFeatures() {
		const { isAutomatedTransfer, isPlaceholder, selectedSite } = this.props;
		return (
			<Fragment>
				<HappinessSupportCard
					isJetpack={ !! selectedSite.jetpack && ! isAutomatedTransfer }
					isJetpackFreePlan
					isPlaceholder={ isPlaceholder }
				/>
				<JetpackWordPressCom selectedSite={ selectedSite } />
				<JetpackReturnToDashboard
					onClick={ this.props.recordReturnToDashboardClick }
					selectedSite={ selectedSite }
				/>
			</Fragment>
		);
	}

	getJetpackPremiumFeatures() {
		const { isAutomatedTransfer, isPlaceholder, selectedSite } = this.props;
		return (
			<Fragment>
				<HappinessSupportCard
					isJetpack={ !! selectedSite.jetpack && ! isAutomatedTransfer }
					isPlaceholder={ isPlaceholder }
				/>
				<MonetizeSite selectedSite={ selectedSite } />
				<JetpackWordPressCom selectedSite={ selectedSite } />
				<JetpackBackupSecurity />
				<JetpackAntiSpam />
				<JetpackPublicize />
				<JetpackVideo />
				<JetpackReturnToDashboard selectedSite={ selectedSite } />
			</Fragment>
		);
	}

	getJetpackPersonalFeatures() {
		const { isAutomatedTransfer, isPlaceholder, selectedSite } = this.props;

		return (
			<Fragment>
				<HappinessSupportCard
					isJetpack={ !! selectedSite.jetpack && ! isAutomatedTransfer }
					isPlaceholder={ isPlaceholder }
				/>
				<JetpackWordPressCom selectedSite={ selectedSite } />
				<JetpackBackupSecurity />
				<JetpackAntiSpam />
				<JetpackReturnToDashboard selectedSite={ selectedSite } />
			</Fragment>
		);
	}

	getJetpackBusinessFeatures() {
		const { isAutomatedTransfer, isPlaceholder, selectedSite } = this.props;
		return (
			<Fragment>
				<HappinessSupportCard
					isJetpack={ !! selectedSite.jetpack && ! isAutomatedTransfer }
					isPlaceholder={ isPlaceholder }
					showLiveChatButton
					liveChatButtonEventName={ 'calypso_livechat_my_plan_jetpack_professsional' }
				/>
				<BusinessOnboarding
					onClick={ this.props.recordBusinessOnboardingClick }
					link="https://calendly.com/jetpack/concierge"
				/>
				<JetpackSearch selectedSite={ selectedSite } />
				<MonetizeSite selectedSite={ selectedSite } />
				<GoogleAnalyticsStats selectedSite={ selectedSite } />
				<JetpackWordPressCom selectedSite={ selectedSite } />
				<FindNewTheme selectedSite={ selectedSite } />
				<JetpackVideo />
				<JetpackPublicize />
				<JetpackBackupSecurity />
				<JetpackAntiSpam />
				<JetpackReturnToDashboard selectedSite={ selectedSite } />
			</Fragment>
		);
	}

	getFeatures() {
		const { plan, isPlaceholder } = this.props;

		if ( isPlaceholder ) {
			return null;
		}

		const { group, type } = getPlan( plan );
		const lookup = {
			[ GROUP_WPCOM ]: {
				[ TYPE_BUSINESS ]: () => this.getBusinessFeatures(),
				[ TYPE_PREMIUM ]: () => this.getPremiumFeatures(),
				[ TYPE_PERSONAL ]: () => this.getPersonalFeatures(),
			},
			[ GROUP_JETPACK ]: {
				[ TYPE_BUSINESS ]: () => this.getJetpackBusinessFeatures(),
				[ TYPE_PREMIUM ]: () => this.getJetpackPremiumFeatures(),
				[ TYPE_PERSONAL ]: () => this.getJetpackPersonalFeatures(),
				[ TYPE_FREE ]: () => this.getJetpackFreeFeatures(),
			},
		};

		const lookupGroup = lookup[ group ];
		const callback = lookupGroup ? lookupGroup[ type ] : null;
		return callback ? callback() : null;
	}

	render() {
		return <div className="product-purchase-features-list">{ this.getFeatures() }</div>;
	}
}

export default connect(
	state => {
		const selectedSite = getSelectedSite( state ),
			selectedSiteId = getSelectedSiteId( state );
		const isAutomatedTransfer = isSiteAutomatedTransfer( state, selectedSiteId );

		return {
			isAutomatedTransfer,
			selectedSite,
			planHasDomainCredit: hasDomainCredit( state, selectedSiteId ),
		};
	},
	{
		recordBusinessOnboardingClick: partial(
			recordTracksEvent,
			'calypso_plan_features_onboarding_click',
			{}
		),
		recordReturnToDashboardClick: partial(
			recordTracksEvent,
			'calypso_plan_features_returntodashboard_click',
			{}
		),
	}
)( ProductPurchaseFeaturesList );
