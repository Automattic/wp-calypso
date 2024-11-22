import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import { Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import Search from '@automattic/search';
import { isMobile } from '@automattic/viewport';
import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { Fragment, useMemo, useState } from 'react';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { pluginsPath } from 'calypso/my-sites/marketing/paths';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import * as T from 'calypso/types';
import MarketingToolsFeature from './feature';
import MarketingToolsHeader from './header';
import { getMarketingFeaturesData } from './marketing-features-data';

import './style.scss';

export default function MarketingTools() {
	const translate = useTranslate();
	const [ searchTerm, setSearchTerm ] = useState( '' );
	const selectedSiteSlug: T.SiteSlug | null = useSelector( getSelectedSiteSlug );
	const siteId = useSelector( getSelectedSiteId ) || 0;

	const marketingFeatures = getMarketingFeaturesData( selectedSiteSlug, translate, localizeUrl );

	const marketingFeaturesFiltered = useMemo( () => {
		return marketingFeatures.filter(
			( feature ) =>
				feature.title.toLowerCase().includes( searchTerm.toLowerCase() ) ||
				feature.description.toLowerCase().includes( searchTerm.toLowerCase() )
		);
	}, [ searchTerm, marketingFeatures ] );

	const handleSearch = ( term: string ) => {
		setSearchTerm( term );
		recordTracksEvent( `calypso_marketing_tools_business_tools_search`, {
			search_term: term,
		} );
	};

	const handleBusinessToolsClick = () => {
		recordTracksEvent( 'calypso_marketing_tools_business_tools_button_click' );

		page( pluginsPath( selectedSiteSlug ) );
	};

	return (
		<Fragment>
			<QueryJetpackPlugins siteIds={ [ siteId ] } />
			<PageViewTracker path="/marketing/tools/:site" title="Marketing > Tools" />

			<MarketingToolsHeader handleButtonClick={ handleBusinessToolsClick } />
			<div
				className={ clsx( 'marketing-tools__searchbox-container', {
					'marketing-tools__searchbox-container--mobile': isMobile(),
				} ) }
			>
				<Search
					className="marketing-tools__searchbox"
					onSearch={ handleSearch }
					defaultValue={ searchTerm }
					searchMode="when-typing"
					placeholder={ translate( 'Try searching "seo"' ) }
					submitOnOpenIconClick
					openIconSide="right"
					displayOpenAndCloseIcons
					delaySearch
					fitsContainer
				/>
			</div>
			<div className="tools__feature-list">
				{ marketingFeaturesFiltered.map( ( feature, index ) => {
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
