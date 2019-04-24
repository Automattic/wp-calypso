/**
 * External dependencies
 */
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React, { Fragment, FunctionComponent } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { getSitePlanSlug, hasFeature } from 'state/sites/plans/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import MarketingToolFeature from './feature';
import MarketingToolsHeader from './header';
import {
	FEATURE_GOOGLE_MY_BUSINESS,
	PLAN_ECOMMERCE,
	PLAN_BUSINESS,
	PLAN_PREMIUM,
} from 'lib/plans/constants';

/**
 * Style dependencies
 */
import './style.scss';

interface MarketingToolsProps {
	hasGoogleMyBusinessAvailable: boolean;
	planIsLessThanPremium: boolean;
}

export const MarketingTools: FunctionComponent< MarketingToolsProps > = ( {
	hasGoogleMyBusinessAvailable,
	planIsLessThanPremium,
} ) => {
	const translate = useTranslate();

	return (
		<Fragment>
			<MarketingToolsHeader />
			<div className="tools__feature-list">
				<MarketingToolFeature
					title={ translate(
						'Reach out to your customers through email marketing with MailChimp'
					) }
					description={ translate(
						"We've partnered with MailChimp so you can reach our to your customers through personalized messaging and custom email campaigns."
					) }
				>
					<Button compact>{ translate( 'Sign up' ) }</Button>
					<Button compact>{ translate( 'Connect' ) }</Button>
				</MarketingToolFeature>
				{ planIsLessThanPremium && (
					<MarketingToolFeature
						title={ translate( 'Advertise online using a $100 credit with Google Adwords' ) }
						description={ translate(
							'Upgrade your plan to take advantage of online advertising to improve your marketing efforts.'
						) }
						disclaimer={ translate(
							'Offer valid in US after spending the first $25 on Google Ads.'
						) }
					>
						<Button compact>{ translate( 'Upgrade to Premium' ) }</Button>
					</MarketingToolFeature>
				) }
				<MarketingToolFeature
					title={ translate( 'Make your brand stand out with a professional logo' ) }
					description={ translate(
						'A logo is an integral part of your brand to make it successful. Create a logo now to stand out from the crowd.'
					) }
				>
					<Button compact>{ translate( 'Design your logo' ) }</Button>
				</MarketingToolFeature>
				<MarketingToolFeature
					title={ translate( 'Easily share your blog posts to your social media circle' ) }
					description={ translate(
						"Connect to Publicize to make it easy to share your site's posts on several social media networks."
					) }
				>
					<Button compact>{ translate( 'Start sharing' ) }</Button>
				</MarketingToolFeature>
				{ hasGoogleMyBusinessAvailable && (
					<MarketingToolFeature
						title={ translate( 'Let your customers find you on Google' ) }
						description={ translate(
							'Get ahead of your competition. Be there when customers search businesses like yours on Google Search and Maps by connecting to Google My Business.'
						) }
					>
						<Button compact>{ translate( 'Connect to Google My Business' ) }</Button>
					</MarketingToolFeature>
				) }
				<MarketingToolFeature
					title={ translate( 'Need an expert to help realize your vision? Hire one!' ) }
					description={ translate(
						"We've partnered with Upwork, a network of freelancers with a huge pool of WordPress experts to help build your dream site."
					) }
				>
					<Button compact>{ translate( 'Find your expert' ) }</Button>
				</MarketingToolFeature>
			</div>
		</Fragment>
	);
};

MarketingTools.propTypes = {
	hasGoogleMyBusinessAvailable: PropTypes.bool.isRequired,
	planIsLessThanPremium: PropTypes.bool.isRequired,
};

MarketingTools.defaultProps = {
	hasGoogleMyBusinessAvailable: false,
	planIsLessThanPremium: false,
};

export default connect( state => {
	const selectedSiteId = getSelectedSiteId( state );
	const selectedSitePlanSlug = selectedSiteId ? getSitePlanSlug( state, selectedSiteId ) : null;
	return {
		hasGoogleMyBusinessAvailable: selectedSiteId
			? hasFeature( state, selectedSiteId, FEATURE_GOOGLE_MY_BUSINESS )
			: false,
		planIsLessThanPremium: selectedSitePlanSlug
			? ! [ PLAN_ECOMMERCE, PLAN_BUSINESS, PLAN_PREMIUM ].includes( selectedSitePlanSlug )
			: false,
	};
} )( MarketingTools );
