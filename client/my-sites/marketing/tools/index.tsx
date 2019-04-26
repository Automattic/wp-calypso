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
import ActionCard from 'components/action-card';
import Button from 'components/button';
import { getSelectedSiteSlug } from 'state/ui/selectors';
import MarketingToolFeature from './feature';
import { marketingToolsSharingButtons, marketingToolsTraffic } from 'my-sites/marketing/paths';
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
		page( marketingToolsTraffic( selectedSiteSlug ) );
	};

	const handleStartSharingClick = () => {
		page( marketingToolsSharingButtons( selectedSiteSlug ) );
	};

	return (
		<Fragment>
			<ActionCard
				headerText={ translate( 'Drive more traffic to your site with our SEO tools' ) }
				mainText={ translate(
					"Optimize your site for search engines and social media by taking advantage of our SEO tools. We'll nail down important SEO strategies to get more exposure for your business."
				) }
				buttonText={ translate( 'Boost my traffic' ) }
				buttonPrimary
				buttonOnClick={ handleBoostMyTrafficClick }
				illustration="/calypso/images/illustrations/illustration-404.svg"
				compact={ false }
			/>
			<div className="tools__feature-list">
				<MarketingToolFeature
					title={ translate( 'Easily share your blog posts to your social media circle' ) }
					description={ translate(
						"Connect to Publicize to make it easy to share your site's posts on several social media networks."
					) }
				>
					<Button onClick={ handleStartSharingClick }>{ translate( 'Start sharing' ) }</Button>
				</MarketingToolFeature>
				<MarketingToolFeature
					title={ translate( 'Need an expert to help realize your vision? Hire one!' ) }
					description={ translate(
						"We've partnered with Upwork, a network of freelancers with a huge pool of WordPress experts to help build your dream site."
					) }
				>
					<Button href={ '/experts/upwork?source=marketingtools' } target="_blank">
						{ translate( 'Find your expert' ) }
					</Button>
				</MarketingToolFeature>
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
