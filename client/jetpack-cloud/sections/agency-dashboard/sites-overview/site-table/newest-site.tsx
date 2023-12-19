import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';

export default function DefineNewestSite( items: Array< object > ) {
	const dispatch = useDispatch();

	const urlParams = new URLSearchParams( window.location.search );
	const shouldRenderAddSitesTour = urlParams.get( 'tour' ) === 'add-new-site';

	const siteList = items.map( ( item: any ) => item.site.value.url );

	const saveSitesPreference = useCallback(
		( type: string, value: object ) => {
			dispatch( savePreference( 'jetpack-cloud-site-sites-list', value ) );
		},
		[ dispatch ]
	);

	useEffect( () => {
		if ( shouldRenderAddSitesTour ) {
			saveSitesPreference( 'site_list', siteList );
			dispatch( recordTracksEvent( 'calypso_jetpack_cloud_add_sites_tour_add_site_list' ) );
		}
		// We only want to run this once
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	const showNewSiteAddedTourPreference = useSelector( ( state: any ) =>
		getPreference( state, 'jetpack-cloud-site-sites-list' )
	);

	let newSites: string[] = [];
	if ( showNewSiteAddedTourPreference && Array.isArray( showNewSiteAddedTourPreference ) ) {
		newSites = siteList.filter( ( x: string ) => ! showNewSiteAddedTourPreference.includes( x ) );
	}

	let newestSite: string = '';
	if ( newSites.length >= 1 && Array.isArray( newSites ) ) {
		newestSite = newSites[ 0 ];
	}

	const tableRows = document.querySelectorAll( '.site-table__table-row a' );
	if ( tableRows.length > 0 ) {
		for ( let i = 0; i < tableRows.length; i++ ) {
			const href = tableRows[ i ].getAttribute( 'href' );
			if ( href === '/activity-log/' + newestSite ) {
				tableRows[ i ].classList.add( 'newest-site-added' );
			}
		}
	}

	return newestSite;
}
