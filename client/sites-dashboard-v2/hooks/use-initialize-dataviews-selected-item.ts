import { SiteDetails } from '@automattic/data-stores';
import { useEffect, useRef } from 'react';

// The @wordpress/dataviews's DataViews component does not accept an initial selected item.
// Therefore, when a page is first loaded, the currently selected site won't be rendered as active.
// As a workaround, until that component allows passing an initial selected item,
// we manually click the selected site so that it is rendered as active.
export function useInitializeDataViewsSelectedItem( {
	selectedSite,
	paginatedSites,
}: {
	selectedSite?: SiteDetails | null;
	paginatedSites: any;
} ) {
	const initialized = useRef( '' );

	useEffect( () => {
		if ( initialized.current === selectedSite?.slug || ! selectedSite ) {
			return;
		}
		for ( const site of document.querySelectorAll( '.sites-dataviews__site' ) ) {
			const slug = site.querySelector( '.sites-dataviews__site-url span' );
			if ( selectedSite.slug === ( slug as HTMLElement )?.innerText ) {
				( site as HTMLElement ).click?.();
				initialized.current = selectedSite.slug;
				break;
			}
		}
	}, [ selectedSite, paginatedSites ] );
}
