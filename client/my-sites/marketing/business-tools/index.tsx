/**
 * External dependencies
 */
import { connect } from 'react-redux';
import React, { Fragment, FunctionComponent } from 'react';
import { useTranslate, getLocaleSlug } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import MarketingBusinessToolsFeature from './feature';
import MarketingBusinessToolsHeader from './header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { recordTracksEvent as recordTracksEventAction } from 'calypso/state/analytics/actions';

/**
 * Images
 */
import facebookMessenger from 'calypso/assets/images/illustrations/facebook-messenger.svg';

/**
 * Types
 */
import * as T from 'calypso/types';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	recordTracksEvent: typeof recordTracksEventAction;
	selectedSiteSlug: T.SiteSlug | null;
}

export const MarketingBusinessTools: FunctionComponent< Props > = ( {
	recordTracksEvent,
	selectedSiteSlug,
} ) => {
	const translate = useTranslate();

	const handlePartnerClick = () => {
		recordTracksEvent( 'calypso_marketing_tools_boost_my_traffic_button_click' );
	};

	return (
		<Fragment>
			<PageViewTracker path="/marketing/tools/:site" title="Marketing > Tools" />

			<MarketingBusinessToolsHeader handleButtonClick={ handlePartnerClick } />

			<div className="business-tools__feature-list">
				<MarketingBusinessToolsFeature
					category={ translate( 'Productivity' ) }
					title={ translate( 'Partner #1' ) }
					description={ translate(
						'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.'
					) }
					imagePath={ facebookMessenger }
				>
					<Button
						onClick={ handlePartnerClick }
						href="https://wordpress.com/plugins/facebook-messenger-customer-chat"
						target="_blank"
					>
						{ translate( 'Call to Action' ) }
					</Button>
				</MarketingBusinessToolsFeature>

				<MarketingBusinessToolsFeature
					category={ translate( 'Productivity' ) }
					title={ translate( 'Partner #2' ) }
					description={ translate(
						'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.'
					) }
					imagePath={ facebookMessenger }
				>
					<Button
						onClick={ handlePartnerClick }
						href="https://wordpress.com/plugins/facebook-messenger-customer-chat"
						target="_blank"
					>
						{ translate( 'Call to Action' ) }
					</Button>
				</MarketingBusinessToolsFeature>

				<MarketingBusinessToolsFeature
					category={ translate( 'Productivity' ) }
					title={ translate( 'Partner #3' ) }
					description={ translate(
						'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.'
					) }
					imagePath={ facebookMessenger }
				>
					<Button
						onClick={ handlePartnerClick }
						href="https://wordpress.com/plugins/facebook-messenger-customer-chat"
						target="_blank"
					>
						{ translate( 'Call to Action' ) }
					</Button>
				</MarketingBusinessToolsFeature>

				<MarketingBusinessToolsFeature
					category={ translate( 'Productivity' ) }
					title={ translate( 'Partner #4' ) }
					description={ translate(
						'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.'
					) }
					imagePath={ facebookMessenger }
				>
					<Button
						onClick={ handlePartnerClick }
						href="https://wordpress.com/plugins/facebook-messenger-customer-chat"
						target="_blank"
					>
						{ translate( 'Call to Action' ) }
					</Button>
				</MarketingBusinessToolsFeature>
			</div>
		</Fragment>
	);
};

export default connect(
	( state ) => ( {
		selectedSiteSlug: getSelectedSiteSlug( state ),
	} ),
	{
		recordTracksEvent: recordTracksEventAction,
	}
)( MarketingBusinessTools );
