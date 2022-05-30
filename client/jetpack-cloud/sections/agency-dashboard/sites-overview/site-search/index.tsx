import { useTranslate } from 'i18n-calypso';
import page from 'page';
import Search from 'calypso/components/search';
import { addQueryArgs } from 'calypso/lib/route';
import type { ReactElement } from 'react';

export default function SiteSearch( {
	searchQuery,
}: {
	searchQuery: string | null;
	currentPage: number;
} ): ReactElement {
	const translate = useTranslate();

	const handleSearchSites = ( query: string ) => {
		const queryParams = {
			...( query && { s: query } ),
		};
		const currentPath = window.location.pathname;
		page( addQueryArgs( queryParams, currentPath ) );
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
