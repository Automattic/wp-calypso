import { SiteDetails } from '@automattic/data-stores';
import { createSitesListComponent } from '@automattic/sites';
import React from 'react';
import Site from 'calypso/blocks/site';
import {
	SitesSortingPreferenceProps,
	withSitesSortingPreference,
} from 'calypso/state/sites/hooks/with-sites-sorting';

// Why isn't `title` part of SiteDetails, though?
type SiteDetailsWithTitle = SiteDetails & { title: string };

interface SitesListProps extends SitesSortingPreferenceProps {
	searchTerm: string;
	addToVisibleSites( siteId: number ): void;
	isReskinned?: boolean;
	sites: SiteDetailsWithTitle[];
	onSelect( event: React.MouseEvent, siteId: number ): void;
	indicator: boolean;
	onMouseEnter( event: React.MouseEvent, siteId: number ): void;
	isHighlighted( siteId: number ): boolean;
	isSelected( site: SiteDetailsWithTitle ): boolean;
}

const SiteSelectorSitesList = createSitesListComponent( { grouping: false } );

const SitesList = ( {
	searchTerm,
	sitesSorting,
	addToVisibleSites,
	isReskinned,
	sites: originalSites,
	onSelect,
	indicator,
	onMouseEnter,
	isHighlighted,
	isSelected,
}: SitesListProps ) => {
	return (
		<SiteSelectorSitesList
			filtering={ { search: searchTerm } }
			sites={ originalSites }
			sorting={ sitesSorting }
		>
			{ ( { sites } ) => (
				<>
					{ sites.map( ( site ) => {
						addToVisibleSites( site.ID );

						return (
							<Site
								site={ site }
								key={ 'site-' + site.ID }
								indicator={ indicator }
								onSelect={ onSelect }
								onMouseEnter={ onMouseEnter }
								isHighlighted={ isHighlighted( site.ID ) }
								isSelected={ isSelected( site ) }
								isReskinned={ isReskinned }
							/>
						);
					} ) }
				</>
			) }
		</SiteSelectorSitesList>
	);
};

export default withSitesSortingPreference( SitesList );
