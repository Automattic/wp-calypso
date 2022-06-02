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
		const params = new URLSearchParams( window.location.search );
		const issueTypes = params.get( 'issue_types' );
		const queryParams = {
			...( query && { s: query } ),
			...( issueTypes && { issue_types: issueTypes } ),
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
