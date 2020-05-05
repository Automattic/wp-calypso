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
import { Button } from '@automattic/components';
import { FEATURE_GOOGLE_MY_BUSINESS, PLAN_BUSINESS } from 'lib/plans/constants';
import getGoogleMyBusinessConnectedLocation from 'state/selectors/get-google-my-business-connected-location';
import { getSelectedSiteSlug, getSelectedSiteId } from 'state/ui/selectors';
import MarketingToolsFeature from './feature';
import MarketingToolsFeatureButtonWithPlanGate from './feature-button-with-plan-gate';
import QueryKeyringConnections from 'components/data/query-keyring-connections';
import QueryKeyringServices from 'components/data/query-keyring-services';
import QuerySiteKeyrings from 'components/data/query-site-keyrings';
import { recordTracksEvent as recordTracksEventAction } from 'state/analytics/actions';

/**
 * Types
 */
import * as T from 'types';

interface Props {
	connectedGoogleMyBusinessLocation?: null | any[];
	recordTracksEvent: typeof recordTracksEventAction;
	selectedSiteId: T.SiteId | null;
	selectedSiteSlug: T.SiteSlug | null;
}

const MarketingToolsGoogleMyBusinessFeature: FunctionComponent< Props > = ( {
	connectedGoogleMyBusinessLocation,
	recordTracksEvent,
	selectedSiteId,
	selectedSiteSlug,
} ) => {
	const handleConnectToGoogleMyBusinessClick = () => {
		recordTracksEvent( 'calypso_marketing_tools_connect_to_google_my_business_button_click' );

		page( `/google-my-business/${ selectedSiteSlug || '' }` );
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
	};

	const translate = useTranslate();

	return (
		<Fragment>
			{ selectedSiteId && <QuerySiteKeyrings siteId={ selectedSiteId } /> }
			<QueryKeyringConnections forceRefresh />
			<QueryKeyringServices />

			<MarketingToolsFeature
				description={ translate(
					'Get ahead of your competition. Be there when customers search businesses like yours on Google Search and Maps by connecting to Google My Business.'
				) }
				imagePath="/calypso/images/marketing/google-my-business-logo.svg"
				title={ translate( 'Let your customers find you on Google' ) }
			>
				{ ! connectedGoogleMyBusinessLocation ? (
					<MarketingToolsFeatureButtonWithPlanGate
						buttonText={ translate( 'Connect to Google My Business' ) }
						feature={ FEATURE_GOOGLE_MY_BUSINESS }
						onDefaultButtonClick={ handleConnectToGoogleMyBusinessClick }
						onUpgradeButtonClick={ handleUpgradeToBusinessPlanClick }
						planSlug={ PLAN_BUSINESS }
					/>
				) : (
					<Button compact onClick={ handleGoToGoogleMyBusinessClick }>
						{ translate( 'Go To Google My Business' ) }
					</Button>
				) }
			</MarketingToolsFeature>
		</Fragment>
	);
};

export default connect(
	( state ) => {
		const selectedSiteId = getSelectedSiteId( state );

		return {
			connectedGoogleMyBusinessLocation: getGoogleMyBusinessConnectedLocation(
				state,
				selectedSiteId
			),
			selectedSiteSlug: getSelectedSiteSlug( state ),
			selectedSiteId,
		};
	},
	{
		recordTracksEvent: recordTracksEventAction,
	}
)( MarketingToolsGoogleMyBusinessFeature );
