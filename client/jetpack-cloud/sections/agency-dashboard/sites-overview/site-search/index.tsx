import { useTranslate } from 'i18n-calypso';
import { ReactElement } from 'react';
import Search from 'calypso/components/search';
import { setQueryArgs } from 'calypso/lib/query-args';

export default function SiteSearch( {
	searchQuery,
	handleSearch,
}: {
	searchQuery: string | null;
	handleSearch: ( query: string ) => void;
} ): ReactElement {
	const translate = useTranslate();

	const handleSearchSites = ( query: string ) => {
		setQueryArgs( '' !== query ? { s: query } : {} );
		handleSearch( query );
	};

	return (
		<Search
			isOpen
			hideClose={ ! searchQuery }
			initialValue={ searchQuery }
			onSearch={ handleSearchSites }
			placeholder={ translate( 'Search sites' ) }
			delaySearch={ true }
		/>
	);
}
