import { SiteDetails } from '@automattic/data-stores';
import { createSitesListComponent } from '@automattic/sites';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import React from 'react';
import Site from 'calypso/blocks/site';
import { addQueryArgs } from 'calypso/lib/url';
import {
	SitesSortingPreferenceProps,
	withSitesSortingPreference,
} from 'calypso/state/sites/hooks/with-sites-sorting';

// Why isn't `title` part of SiteDetails, though?
type SiteDetailsWithTitle = SiteDetails & { title: string };

interface SitesListProps extends SitesSortingPreferenceProps {
	maxResults?: number;
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
	maxResults,
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
	const { __ } = useI18n();
	return (
		<SiteSelectorSitesList
			filtering={ { search: searchTerm } }
			sites={ originalSites }
			sorting={ sitesSorting }
		>
			{ ( { sites } ) => {
				if ( sites.length === 0 ) {
					return <div className="site-selector__no-results">{ __( 'No sites found' ) }</div>;
				}

				const slicedSites = maxResults != null ? sites.slice( 0, maxResults ) : sites;

				return (
					<>
						{ slicedSites.map( ( site ) => {
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
						{ slicedSites.length < sites.length && (
							<span className="site-selector__list-bottom-adornment">
								{ createInterpolateElement(
									sprintf(
										// translators: maxResults is the maximum number of list results.
										__(
											'This list is limited to the first %(maxResults)d results. Open the <a>sites page</a> to view more.'
										),
										{
											maxResults,
										}
									),
									{
										a: (
											<a
												href={ addQueryArgs(
													{ search: searchTerm.length > 0 ? searchTerm : null },
													'/sites'
												) }
												target="_blank"
												rel="noopener noreferrer"
											/>
										),
									}
								) }
							</span>
						) }
					</>
				);
			} }
		</SiteSelectorSitesList>
	);
};

export default withSitesSortingPreference( SitesList );
