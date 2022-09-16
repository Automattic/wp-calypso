import { SiteDetails } from '@automattic/data-stores';
import { useFuzzySearch } from '@automattic/search';
import { createHigherOrderComponent } from '@wordpress/compose';
import { ComponentType, useState } from 'react';

interface SearchSitesProps {
	searchTerm: string | null;
	searchSites( term: string ): void;
	sitesFound: SiteDetails[] | null;
}

const searchSites = createHigherOrderComponent(
	< OuterProps extends { sites: SiteDetails[] } >(
		Component: ComponentType< OuterProps & SearchSitesProps >
	) => {
		return ( props: OuterProps ) => {
			const [ term, setTerm ] = useState< string | null >( null );

			const results = useFuzzySearch( {
				data: props.sites,
				keys: [ 'name', 'slug', 'title', 'URL' ],
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
