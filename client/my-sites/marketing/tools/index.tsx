/**
 * External dependencies
 */
import { connect } from 'react-redux';
import page from 'page';
import React, { Fragment, FunctionComponent } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { getSelectedSiteSlug } from 'state/ui/selectors';
import MarketingToolsGoogleAdwordsFeature from './google-adwords';
import MarketingPageFeature from 'components/marketing-page-feature';
import MarketingToolsGoogleMyBusinessFeature from './google-my-business-feature';
import MarketingPageHeader from 'components/marketing-page-header';
import { marketingConnections, marketingTraffic } from 'my-sites/marketing/paths';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { recordTracksEvent as recordTracksEventAction } from 'state/analytics/actions';

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
}

export const MarketingTools: FunctionComponent< Props > = ( {
	recordTracksEvent,
	selectedSiteSlug,
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

	return (
		<Fragment>
			<PageViewTracker path="/marketing/tools/:site" title="Marketing > Tools" />

			<MarketingPageHeader
				buttonCopy={ translate( 'Boost My Traffic' ) }
				description={ translate(
					"Optimize your site for search engines and get more exposure for your business. Let's make the most of your site's built-in SEO tools!"
				) }
				handleButtonClick={ handleBoostMyTrafficClick }
				illustrationAlt={ translate( 'Your site with Marketing Tools' ) }
				illustrationUrl={ '/calypso/images/illustrations/illustration-404.svg' }
				title={ translate( 'Drive more traffic to your site with better SEO' ) }
			/>

			<div className="tools__feature-list">
				<MarketingPageFeature
					title={ translate( 'Want to build a great brand? Start with a great logo' ) }
					description={ translate(
						"A custom logo helps your brand pop and makes your site memorable. Our partner Looka is standing by if you'd like some professional help."
					) }
					imagePath="/calypso/images/marketing/looka-logo.svg"
				>
					<Button
						compact
						onClick={ handleCreateALogoClick }
						href={ 'http://logojoy.grsm.io/looka' }
						target="_blank"
					>
						{ translate( 'Create A Logo' ) }
					</Button>
				</MarketingPageFeature>

				<MarketingPageFeature
					title={ translate( 'Get social, and share your blog posts where the people are' ) }
					description={ translate(
						"Use your site's Publicize tools to connect your site and your social media accounts, and share your new posts automatically. Connect to Twitter, Facebook, LinkedIn, and more."
					) }
					imagePath="/calypso/images/marketing/social-media-logos.svg"
				>
					<Button compact onClick={ handleStartSharingClick }>
						{ translate( 'Start Sharing' ) }
					</Button>
				</MarketingPageFeature>

				<MarketingToolsGoogleMyBusinessFeature />

				<MarketingToolsGoogleAdwordsFeature />

				<MarketingPageFeature
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
				</MarketingPageFeature>
			</div>
		</Fragment>
	);
};

export default connect(
	state => ( {
		selectedSiteSlug: getSelectedSiteSlug( state ),
	} ),
	{
		recordTracksEvent: recordTracksEventAction,
	}
)( MarketingTools );
