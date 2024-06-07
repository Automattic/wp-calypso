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
	const initialized = useRef( false );

	useEffect( () => {
		if ( initialized.current || ! selectedSite ) {
			return;
		}

		const selector = selectedSite.is_wpcom_staging_site
			? '.site-dataviews__staging-site'
			: '.sites-dataviews__site';

		for ( const site of document.querySelectorAll( selector ) ) {
			const slug = selectedSite.is_wpcom_staging_site
				? site.getAttribute( 'data-site-slug' )
				: ( site.querySelector( '.sites-dataviews__site-url span' ) as HTMLElement )?.innerText;

			if ( selectedSite.slug === slug ) {
				( site as HTMLElement ).click?.();
				initialized.current = true;
				break;
			}
		}
	}, [ selectedSite, paginatedSites ] );
}
