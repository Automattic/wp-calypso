/**
 * External dependencies
 */
import { connect } from 'react-redux';
import page from 'page';
import PropTypes from 'prop-types';
import React, { Fragment, FunctionComponent } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { getSelectedSiteSlug } from 'state/ui/selectors';
import MarketingToolsFeature from './feature';
import MarketingToolsHeader from './header';
import { marketingSharingButtons, marketingTraffic } from 'my-sites/marketing/paths';

/**
 * Style dependencies
 */
import './style.scss';

interface MarketingToolsProps {
	selectedSiteSlug: string | null;
}

export const MarketingTools: FunctionComponent< MarketingToolsProps > = ( {
	selectedSiteSlug,
} ) => {
	const translate = useTranslate();

	const handleBoostMyTrafficClick = () => {
		page( marketingTraffic( selectedSiteSlug ) );
	};

	const handleStartSharingClick = () => {
		page( marketingSharingButtons( selectedSiteSlug ) );
	};

	return (
		<Fragment>
			<MarketingToolsHeader handleButtonClick={ handleBoostMyTrafficClick } />
			<div className="tools__feature-list">
				<MarketingToolsFeature
					title={ translate( 'Get social, and share your blog posts where the people are' ) }
					description={ translate(
						'Use your site’s Publicize tools to connect your site and your social media accounts, and share your new posts automatically. Connect to Twitter, Facebook, LinkedIn, and more.'
					) }
					imagePath="/calypso/images/illustrations/marketing.svg"
				>
					<Button onClick={ handleStartSharingClick }>{ translate( 'Start Sharing' ) }</Button>
				</MarketingToolsFeature>

				<MarketingToolsFeature
					title={ translate( 'Need an expert to help realize your vision? Hire one!' ) }
					description={ translate(
						'We’ve partnered with Upwork, a network of freelancers with a huge pool of WordPress experts. Hire a pro to help build your dream site.'
					) }
					imagePath="/calypso/images/illustrations/expert.svg"
				>
					<Button href={ '/experts/upwork?source=marketingtools' } target="_blank">
						{ translate( 'Find Your Expert' ) }
					</Button>
				</MarketingToolsFeature>
			</div>
		</Fragment>
	);
};

MarketingTools.propTypes = {
	selectedSiteSlug: PropTypes.string,
};

export default connect( state => ( {
	selectedSiteSlug: getSelectedSiteSlug( state ),
} ) )( MarketingTools );
