import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import Search from 'calypso/components/search';
import { updateDashboardURLQueryArgs } from 'calypso/state/jetpack-agency-dashboard/actions';

export default function SiteSearch( {
	searchQuery,
}: {
	searchQuery: string | null;
	currentPage: number;
} ) {
	const translate = useTranslate();
	const isMobile = useMobileBreakpoint();

	const handleSearchSites = ( search: string ) => {
		updateDashboardURLQueryArgs( { search } );
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
			delaySearch
		/>
	);
}
