import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import { ResponsiveToolbarGroup, Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import Search, { ImperativeHandle } from '@automattic/search';
import { isMobile } from '@automattic/viewport';
import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState, useRef } from 'react';
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
	const [ selectedCategory, setSelectedCategory ] = useState( '' );
	const [ isUserTyping, setIsUserTyping ] = useState( false );
	const searchRef = useRef< ImperativeHandle >( null );
	const selectedSiteSlug: T.SiteSlug | null = useSelector( getSelectedSiteSlug );
	const siteId = useSelector( getSelectedSiteId ) || 0;
	const items = [
		{ key: '', text: translate( 'All' ) },
		{ key: 'new', text: translate( 'New tools' ) },
		{ key: 'favourite', text: translate( 'User favorites' ) },
	];

	const marketingFeatures = getMarketingFeaturesData( selectedSiteSlug, translate, localizeUrl );

	const marketingFeaturesFiltered = useMemo( () => {
		let filteredFeatures = marketingFeatures.filter( ( feature ) =>
			( feature.title.toLowerCase() + feature.description.toLowerCase() ).includes(
				searchTerm.toLowerCase()
			)
		);
		if ( selectedCategory ) {
			filteredFeatures = filteredFeatures.filter( ( feature ) =>
				feature.categories.includes( selectedCategory )
			);
		}
		return filteredFeatures;
	}, [ searchTerm, selectedCategory, marketingFeatures ] );

	const handleSearch = ( term: string ) => {
		// Prevents loops, only clears the category when the user is typing
		if ( isUserTyping ) {
			setSelectedCategory( '' );
		}
		setIsUserTyping( false );
		setSearchTerm( term );
		recordTracksEvent( 'calypso_marketing_tools_business_tools_search', {
			search_term: term,
		} );
	};

	const handleSelect = ( key: string ) => {
		setSelectedCategory( key );
		setSearchTerm( '' );
		searchRef?.current?.clear();
	};

	const handleSearchChange = () => {
		setIsUserTyping( true );
	};

	const handleBusinessToolsClick = () => {
		recordTracksEvent( 'calypso_marketing_tools_business_tools_button_click' );

		page( pluginsPath( selectedSiteSlug ) );
	};

	return (
		<div className="tools__wrapper">
			<QueryJetpackPlugins siteIds={ [ siteId ] } />
			<PageViewTracker path="/marketing/tools/:site" title="Marketing > Tools" />

			<MarketingToolsHeader handleButtonClick={ handleBusinessToolsClick } />
			<div className="marketing-tools__toolbar-container">
				<div
					className={ clsx( 'marketing-tools__searchbox-container', {
						'marketing-tools__searchbox-container--mobile': isMobile(),
					} ) }
				>
					<Search
						className="marketing-tools__searchbox"
						ref={ searchRef }
						onSearch={ handleSearch }
						onSearchChange={ handleSearchChange }
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
				{ ! isMobile() && <div className="marketing-tools__tooolbar-vertical-separator" /> }
				<ResponsiveToolbarGroup
					className="marketing-tools__search-categories-toolbar"
					initialActiveIndex={
						selectedCategory ? items.findIndex( ( item ) => item.key === selectedCategory ) : 0
					}
					forceSwipe={ 'undefined' === typeof window }
					onClick={ ( index: number ) => handleSelect( items[ index ]?.key ) }
					swipeEnabled={ false }
				>
					{ items.map( ( item ) => (
						<span key={ `themes-toolbar-group-item-${ item.key }` }>{ item.text }</span>
					) ) }
				</ResponsiveToolbarGroup>
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
		</div>
	);
}
