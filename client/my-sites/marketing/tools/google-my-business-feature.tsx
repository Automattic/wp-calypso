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
import getGoogleMyBusinessConnectedLocation from 'state/selectors/get-google-my-business-connected-location';
import { getSelectedSiteSlug, getSelectedSiteId } from 'state/ui/selectors';
import { FEATURE_GOOGLE_MY_BUSINESS, PLAN_BUSINESS } from 'lib/plans/constants';
import MarketingToolsFeature from './feature';
import MarketingToolsFeatureButtonWithPlanGate from './feature-button-with-plan-gate';
import QueryKeyringConnections from 'components/data/query-keyring-connections';
import QueryKeyringServices from 'components/data/query-keyring-services';
import QuerySiteKeyrings from 'components/data/query-site-keyrings';

interface Props {
	connectedGoogleMyBusinessLocation?: null | any[];
	selectedSiteId: number | null;
	selectedSiteSlug: string | null;
}

const MarketingToolsGoogleMyBusinessFeature: FunctionComponent< Props > = ( {
	connectedGoogleMyBusinessLocation,
	selectedSiteId,
	selectedSiteSlug,
} ) => {
	const handleConnectToGoogleMyBusinessClick = () => {
		page( `/google-my-business/${ selectedSiteSlug || '' }` );
	};

	const handleGoToGoogleMyBusinessClick = () => {
		page( `/google-my-business/${ selectedSiteSlug || '' }` );
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
				imagePath="/calypso/images/illustrations/business.svg"
				title={ translate( 'Let your customers find you on Google' ) }
			>
				{ ! connectedGoogleMyBusinessLocation ? (
					<MarketingToolsFeatureButtonWithPlanGate
						buttonText={ translate( 'Connect to Google My Business' ) }
						feature={ FEATURE_GOOGLE_MY_BUSINESS }
						minPlanSlug={ PLAN_BUSINESS }
						handleButtonClick={ handleConnectToGoogleMyBusinessClick }
					/>
				) : (
					<Button onClick={ handleGoToGoogleMyBusinessClick }>
						{ translate( 'Go to Google My Business' ) }
					</Button>
				) }
			</MarketingToolsFeature>
		</Fragment>
	);
};

export default connect( state => {
	const selectedSiteId = getSelectedSiteId( state );
	return {
		connectedGoogleMyBusinessLocation: getGoogleMyBusinessConnectedLocation(
			state,
			selectedSiteId
		),
		selectedSiteSlug: getSelectedSiteSlug( state ),
		selectedSiteId,
	};
} )( MarketingToolsGoogleMyBusinessFeature );
