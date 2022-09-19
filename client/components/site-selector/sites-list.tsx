import { withSitesTableSorting } from '@automattic/components';
import { SiteDetails } from '@automattic/data-stores';
import { flow } from 'lodash';
import React from 'react';
import Site from 'calypso/blocks/site';
import { withSitesSortingPreference } from 'calypso/state/sites/hooks/with-sites-sorting';

interface SitesListProps {
	addToVisibleSites( siteId: number ): void;
	isReskinned?: boolean;
	sites: SiteDetails[];
	onSelect( event: React.MouseEvent, siteId: number ): void;
	indicator: boolean;
	onMouseEnter( event: React.MouseEvent, siteId: number ): void;
	isHighlighted( siteId: number ): boolean;
	isSelected( site: SiteDetails ): boolean;
}

const SitesList = ( {
	addToVisibleSites,
	isReskinned,
	sites,
	onSelect,
	indicator,
	onMouseEnter,
	isHighlighted,
	isSelected,
}: SitesListProps ) => {
	return (
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
	);
};

export default flow( withSitesTableSorting, withSitesSortingPreference )( SitesList );
