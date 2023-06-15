import { SiteDetails } from '@automattic/data-stores';
import { useFuzzySearch } from '@automattic/search';
import { SITES_SEARCH_INDEX_KEYS } from '@automattic/sites';
import { createHigherOrderComponent } from '@wordpress/compose';
import { ComponentType, useState } from 'react';

interface SearchSitesProps {
	searchTerm: string | null;
	searchSites( term: string ): void;
	sitesFound: SiteDetails[] | null;
}

const searchSites = createHigherOrderComponent(
	< OuterProps, >( Component: ComponentType< OuterProps & SearchSitesProps > ) => {
		return ( props: OuterProps & { sites: SiteDetails[] } ) => {
			const [ term, setTerm ] = useState< string | null >( null );

			const results = useFuzzySearch( {
				data: props.sites,
				keys: SITES_SEARCH_INDEX_KEYS,
				query: term ?? '',
			} );

			return (
				<Component
					{ ...props }
					searchTerm={ term }
					searchSites={ setTerm }
					sitesFound={ term ? results : null }
				/>
			);
		};
	},
	'withSearchSites'
);

export default searchSites;
