// import { useTranslate, getLocaleSlug } from 'i18n-calypso';
import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import { getLocaleSlug } from 'i18n-calypso';
import { Fragment } from 'react';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { pluginsPath } from 'calypso/my-sites/marketing/paths';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent as recordTracksEventAction } from 'calypso/state/analytics/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import * as T from 'calypso/types';
import MarketingToolsFeature from './feature';
import MarketingToolsHeader from './header';
import { getMarketingFeaturesData } from './marketing-features-data';

import './style.scss';

export default function MarketingTools() {
	const dispatch = useDispatch();
	const recordTracksEvent = ( event: string ) => dispatch( recordTracksEventAction( event ) );
	const selectedSiteSlug: T.SiteSlug | null = useSelector( getSelectedSiteSlug );
	const siteId = useSelector( getSelectedSiteId ) || 0;
	const isEnglish = ( config( 'english_locales' ) as string[] ).includes( getLocaleSlug() ?? '' );

	const marketingFeatures = getMarketingFeaturesData( selectedSiteSlug, recordTracksEvent );

	const handleBusinessToolsClick = () => {
		recordTracksEvent( 'calypso_marketing_tools_business_tools_button_click' );

		page( pluginsPath( selectedSiteSlug ) );
	};

	return (
		<Fragment>
			<QueryJetpackPlugins siteIds={ [ siteId ] } />
			<PageViewTracker path="/marketing/tools/:site" title="Marketing > Tools" />

			<MarketingToolsHeader handleButtonClick={ handleBusinessToolsClick } />

			<div className="tools__feature-list">
				{ marketingFeatures.map( ( feature, index ) => {
					if ( feature.showOnlyInEnglish && ! isEnglish ) {
						return null;
					}

					return (
						<MarketingToolsFeature
							key={ index }
							title={ feature.title }
							description={ feature.description }
							imagePath={ feature.imagePath }
							imageAlt={ feature.imageAlt }
						>
							<Button
								onClick={ feature.onClick }
								href={ feature.buttonHref }
								target={ feature.buttonTarget }
								variant="link"
							>
								{ feature.buttonText }
								<Gridicon style={ { marginLeft: '8px' } } icon="chevron-right" size={ 12 } />
							</Button>
						</MarketingToolsFeature>
					);
				} ) }
			</div>
		</Fragment>
	);
}
