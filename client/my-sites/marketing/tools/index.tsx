/**
 * External dependencies
 */
import { connect } from 'react-redux';
import page from 'page';
import React, { Fragment, FunctionComponent } from 'react';
import { useTranslate } from 'i18n-calypso';
import { get, compact } from 'lodash';

/**
 * Internal dependencies
 */
import { addQueryArgs } from 'lib/url';
import { FEATURE_GOOGLE_MY_BUSINESS, PLAN_BUSINESS, PLAN_PREMIUM } from 'lib/plans/constants';
import { getCurrentUserCountryCode } from 'state/current-user/selectors';
import getGoogleMyBusinessConnectedLocation from 'state/selectors/get-google-my-business-connected-location';
import { hasFeature } from 'state/sites/plans/selectors';
import { getSelectedSiteId, getSelectedSiteSlug, getSelectedSite } from 'state/ui/selectors';
import { isPremium, isBusiness, isEcommerce, isEnterprise } from 'lib/products-values';
import isSiteAtomic from 'state/selectors/is-site-automated-transfer';
import QueryKeyringConnections from 'components/data/query-keyring-connections';
import QueryKeyringServices from 'components/data/query-keyring-services';
import QuerySiteKeyrings from 'components/data/query-site-keyrings';
import QuerySiteVouchers from 'components/data/query-site-vouchers';
import GoogleVoucherDetails from 'my-sites/checkout/checkout-thank-you/google-voucher';

import PageViewTracker from 'lib/analytics/page-view-tracker';
import { recordTracksEvent as recordTracksEventAction } from 'state/analytics/actions';

import Button from 'components/button';
import MarketingToolsGoogleAdwordsFeature from './google-adwords';
import MarketingToolsFeature from './feature';
import MarketingToolsGoogleMyBusinessFeature from './google-my-business-feature';
import MarketingToolsHeader from './header';
import { marketingConnections, marketingTraffic } from 'my-sites/marketing/paths';

import PromoSection, {
	Props as PromoSectionProps,
	PromoSectionCardProps,
} from 'components/promo-section';

/**
 * Types
 */
import * as T from 'types';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	recordTracksEvent: typeof recordTracksEventAction;
	selectedSiteSlug: T.SiteSlug | null;
	selectedSiteId: number;
	hasGoogleMyBusiness: boolean;
	connectedGoogleMyBusinessLocation: string;
	showAdsCard: boolean;
}

export const MarketingTools: FunctionComponent< Props > = ( {
	recordTracksEvent,
	selectedSiteSlug,
	selectedSiteId,
	hasGoogleMyBusiness,
	connectedGoogleMyBusinessLocation,
	showAdsCard,
	isPremiumOrHigher,
} ) => {
	const translate = useTranslate();

	const handleBoostMyTrafficClick = () => {
		recordTracksEvent( 'calypso_marketing_tools_boost_my_traffic_button_click' );

		page( marketingTraffic( selectedSiteSlug ) );
	};

	const handleCreateALogoClick = () => {
		recordTracksEvent( 'calypso_marketing_tools_create_a_logo_button_click' );
	};

	const handleFindYourExpertClick = () => {
		recordTracksEvent( 'calypso_marketing_tools_find_your_expert_button_click' );
	};

	const handleStartSharingClick = () => {
		recordTracksEvent( 'calypso_marketing_tools_start_sharing_button_click' );

		page( marketingConnections( selectedSiteSlug ) );
	};

	const handleConnectToGoogleMyBusinessClick = () => {
		recordTracksEvent( 'calypso_marketing_tools_connect_to_google_my_business_button_click' );

		page( `/google-my-business/new/${ selectedSiteSlug || '' }` );
	};

	const handleGoToGoogleMyBusinessClick = () => {
		recordTracksEvent( 'calypso_marketing_tools_go_to_google_my_business_button_click' );

		page( `/google-my-business/stats/${ selectedSiteSlug || '' }` );
	};

	const handleUpgradeToBusinessPlanClick = () => {
		recordTracksEvent(
			'calypso_marketing_tools_google_my_business_upgrade_to_business_button_click',
			{
				plan_slug: PLAN_BUSINESS,
				feature: FEATURE_GOOGLE_MY_BUSINESS,
			}
		);
		page( addQueryArgs( { plan: PLAN_BUSINESS }, `/plans/${ selectedSiteSlug }` ) );
	};

	const handleGoogleAdsUpgrade = () => {
		recordTracksEvent( 'calypso_marketing_tools_adwords_plan_upgrade_button_click' );
		page( addQueryArgs( { plan: PLAN_PREMIUM }, `/plans/${ selectedSiteSlug }` ) );
	};

	const getLogoCard = (): PromoSectionCardProps => {
		return {
			title: translate( 'Want to build a great brand? Start with a great logo' ),
			body: translate(
				"A custom logo helps your brand pop and makes your site memorable. Our partner Looka is standing by if you'd like some professional help."
			),
			image: {
				path: '/calypso/images/marketing/looka-logo.svg',
			},
			actions: {
				cta: {
					text: translate( 'Create A Logo' ),
					action: {
						url: 'http://logojoy.grsm.io/looka',
						onClick: handleCreateALogoClick,
					},
				},
			},
		};
	};

	const getSocialCard = (): PromoSectionCardProps => {
		return {
			title: translate( 'Get social, and share your blog posts where the people are' ),
			body: translate(
				"Use your site's Publicize tools to connect your site and your social media accounts, and share your new posts automatically. Connect to Twitter, Facebook, LinkedIn, and more."
			),
			image: {
				path: '/calypso/images/marketing/social-media-logos.svg',
			},
			actions: {
				cta: {
					text: translate( 'Start Sharing' ),
					action: handleStartSharingClick,
				},
			},
		};
	};

	const getGoogleMyBusinessCard = (): PromoSectionCardProps => {
		const cta = hasGoogleMyBusiness
			? {
					text: connectedGoogleMyBusinessLocation
						? translate( 'Go To Google My Business' )
						: translate( 'Connect to Google My Business' ),
					action: connectedGoogleMyBusinessLocation
						? handleGoToGoogleMyBusinessClick
						: handleConnectToGoogleMyBusinessClick,
			  }
			: {
					text: translate( 'Upgrade to Business' ),
					action: handleUpgradeToBusinessPlanClick,
			  };

		return {
			title: translate( 'Let your customers find you on Google' ),
			body: translate(
				'Get ahead of your competition. Be there when customers search businesses like yours on Google Search and Maps by connecting to Google My Business.'
			),
			image: {
				path: '/calypso/images/marketing/google-my-business-logo.svg',
			},
			actions: {
				cta,
			},
		};
	};

	const getGoogleAdsCard = (): PromoSectionCardProps => {
		if ( ! showAdsCard ) {
			return null;
		}
		return {
			title: translate( 'Advertise with your %(cost)s Google Adwords credit', {
				args: {
					cost: '$100',
				},
			} ),
			body: translate(
				"Advertise your site where most people are searching: Google. You've got a %(cost)s credit with Google Adwords to drive traffic to your most important pages.",
				{
					args: {
						cost: '$100',
					},
				}
			),
			image: {
				path: '/calypso/images/marketing/google-ads-logo.png',
			},
			actions: isPremiumOrHigher ? (
				<GoogleVoucherDetails />
			) : (
				{
					cta: {
						text: translate( 'Upgrade to Premium' ),
						action: handleGoogleAdsUpgrade,
					},
				}
			),
		};
	};

	const getExpertCard = (): PromoSectionCardProps => {
		return {
			title: translate( 'Need an expert to help realize your vision? Hire one!' ),
			body: translate(
				"We've partnered with Upwork, a network of freelancers with a huge pool of WordPress experts. Hire a pro to help build your dream site."
			),
			image: {
				path: '/calypso/images/marketing/upwork-logo.png',
			},
			actions: {
				cta: {
					text: translate( 'Find Your Expert' ),
					action: {
						url: '/experts/upwork?source=marketingtools',
						onClick: handleFindYourExpertClick,
					},
				},
			},
		};
	};

	const promos: PromoSectionProps = {
		header: {
			title: translate( 'Drive more traffic to your site with better SEO' ),
			body: translate(
				"Optimize your site for search engines and get more exposure for your business. Let's make the most of your site's built-in SEO tools!"
			),
			image: {
				path: '/calypso/images/illustrations/illustration-404.svg',
			},
			actions: {
				cta: {
					text: translate( 'Boost My Traffic' ),
					action: handleBoostMyTrafficClick,
				},
			},
		},
		promos: compact( [
			getLogoCard(),
			getSocialCard(),
			getGoogleMyBusinessCard(),
			getGoogleAdsCard(),
			getExpertCard(),
		] ),
	};

	return (
		<Fragment>
			{ selectedSiteId && <QuerySiteKeyrings siteId={ selectedSiteId } /> }
			<QueryKeyringConnections forceRefresh />
			<QueryKeyringServices />
			{ showAdsCard && <QuerySiteVouchers siteId={ selectedSiteId } /> }

			<PageViewTracker path="/marketing/tools/:site" title="Marketing > Tools" />
			<PromoSection { ...promos } />

			<MarketingToolsHeader handleButtonClick={ handleBoostMyTrafficClick } />

			<div className="tools__feature-list">
				<MarketingToolsFeature
					title={ translate( 'Want to build a great brand? Start with a great logo' ) }
					description={ translate(
						"A custom logo helps your brand pop and makes your site memorable. Our partner Looka is standing by if you'd like some professional help."
					) }
					imagePath="/calypso/images/marketing/looka-logo.svg"
				>
					<Button
						compact
						onClick={ handleCreateALogoClick }
						href="http://logojoy.grsm.io/looka"
						target="_blank"
					>
						{ translate( 'Create A Logo' ) }
					</Button>
				</MarketingToolsFeature>

				<MarketingToolsFeature
					title={ translate( 'Get social, and share your blog posts where the people are' ) }
					description={ translate(
						"Use your site's Publicize tools to connect your site and your social media accounts, and share your new posts automatically. Connect to Twitter, Facebook, LinkedIn, and more."
					) }
					imagePath="/calypso/images/marketing/social-media-logos.svg"
				>
					<Button compact onClick={ handleStartSharingClick }>
						{ translate( 'Start Sharing' ) }
					</Button>
				</MarketingToolsFeature>

				<MarketingToolsGoogleMyBusinessFeature />

				<MarketingToolsGoogleAdwordsFeature />

				<MarketingToolsFeature
					title={ translate( 'Need an expert to help realize your vision? Hire one!' ) }
					description={ translate(
						"We've partnered with Upwork, a network of freelancers with a huge pool of WordPress experts. Hire a pro to help build your dream site."
					) }
					imagePath="/calypso/images/marketing/upwork-logo.png"
				>
					<Button
						compact
						onClick={ handleFindYourExpertClick }
						href={ '/experts/upwork?source=marketingtools' }
						target="_blank"
					>
						{ translate( 'Find Your Expert' ) }
					</Button>
				</MarketingToolsFeature>
			</div>
		</Fragment>
	);
};

export default connect(
	state => {
		const selectedSiteId = getSelectedSiteId( state );
		const selectedSiteSlug = getSelectedSiteSlug( state );
		const userInUsa = getCurrentUserCountryCode( state ) === 'US';
		const userInCa = getCurrentUserCountryCode( state ) === 'CA';
		const isAtomic = isSiteAtomic( state, selectedSiteId ) || false;
		const site = getSelectedSite( state );
		const selectedSitePlan = get( site, 'plan', null );
		const isPremiumOrHigher =
			isPremium( selectedSitePlan ) ||
			isBusiness( selectedSitePlan ) ||
			isEcommerce( selectedSitePlan ) ||
			isEnterprise( selectedSitePlan );
		const isJetPack = get( site, 'jetpack', null );

		return {
			hasGoogleMyBusiness: hasFeature( state, selectedSiteId, FEATURE_GOOGLE_MY_BUSINESS ),
			selectedSiteId,
			selectedSiteSlug,
			isPremiumOrHigher,
			showAdsCard: ( userInCa || userInUsa ) && ! ( isJetPack && ! isAtomic ),
			connectedGoogleMyBusinessLocation: getGoogleMyBusinessConnectedLocation(
				state,
				selectedSiteId
			),
		};
	},
	{
		recordTracksEvent: recordTracksEventAction,
	}
)( MarketingTools );
