import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import Search from 'calypso/components/search';
import { addQueryArgs } from 'calypso/lib/route';

export default function SiteSearch( {
	searchQuery,
}: {
	searchQuery: string | null;
	currentPage: number;
} ) {
	const translate = useTranslate();
	const isMobile = useMobileBreakpoint();

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
			hideFocus
			isOpen
			hideClose={ ! searchQuery || ! isMobile }
			initialValue={ searchQuery }
			onSearch={ handleSearchSites }
			placeholder={
				isMobile ? translate( 'Search sites' ) : translate( 'Search by site title or domain' )
			}
			delaySearch={ true }
		/>
	);
}
