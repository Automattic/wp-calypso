import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import Search, { SEARCH_MODE_ON_ENTER } from 'calypso/components/search';
import { usePatternsContext } from 'calypso/my-sites/patterns/context';
import { QUERY_PARAM_SEARCH } from 'calypso/my-sites/patterns/lib/filter-patterns-by-term';

type PatternsSearchFieldProps = {
	isCollapsible?: boolean;
};

export const PatternsSearchField = ( { isCollapsible = false }: PatternsSearchFieldProps ) => {
	const translate = useTranslate();
	const { searchTerm, category } = usePatternsContext();

	const handleSearch = ( newValue: string ) => {
		const url = new URL( window.location.href );

		if ( newValue ) {
			url.searchParams.set( QUERY_PARAM_SEARCH, newValue );

			// Strip out `ref` parameter when updating the URL for search
			// to ensure the referrer is only be reported in the initial page view.
			url.searchParams.delete( 'ref' );
		} else {
			url.searchParams.delete( QUERY_PARAM_SEARCH );
		}

		if ( document.activeElement instanceof HTMLInputElement ) {
			document.activeElement.blur();
		}

		if ( url.href !== location.href ) {
			page( url.href.replace( url.origin, '' ) );
		}
	};

	return (
		<Search
			initialValue={ searchTerm }
			key={ `search-${ category }` }
			onSearch={ handleSearch }
			placeholder={ translate( 'Search patterns…' ) }
			searchMode={ SEARCH_MODE_ON_ENTER }
			value={ searchTerm }
			pinned={ isCollapsible }
		/>
	);
};
