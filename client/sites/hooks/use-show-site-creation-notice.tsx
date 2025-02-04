import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useRef } from 'react';
import { withoutHttp } from 'calypso/lib/url';
import { useDispatch } from 'calypso/state';
import { successNotice } from 'calypso/state/notices/actions';
import type { SiteExcerptData } from '@automattic/sites';

export function useShowSiteCreationNotice(
	allSites: SiteExcerptData[],
	newSiteID: number | undefined
) {
	const { __ } = useI18n();
	const dispatch = useDispatch();
	const shownSiteCreationNotice = useRef( false );

	useEffect( () => {
		if ( shownSiteCreationNotice.current || ! newSiteID ) {
			return;
		}

		const site = allSites.find( ( { ID } ) => ID === newSiteID );
		if ( ! site ) {
			return;
		}

		shownSiteCreationNotice.current = true;

		dispatch(
			successNotice(
				createInterpolateElement(
					/* translators: siteURL is the URL name of a newly created site, excluding the "http://" */
					sprintf( __( 'New site <strong>%(siteURL)s</strong> created.' ), {
						siteURL: withoutHttp( site.URL ),
					} ),
					{ strong: <strong /> }
				),
				{ duration: 8000 }
			)
		);

		// Remove query param without triggering a re-render
		const newUrl = new URL( window.location.href );
		newUrl.searchParams.delete( 'new-site' );
		window.history.replaceState( null, '', newUrl.toString() );
	}, [ __, allSites, dispatch, newSiteID ] );
}
