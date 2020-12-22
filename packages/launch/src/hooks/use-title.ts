/**
 * External dependencies
 */
import { useDispatch, useSelect } from '@wordpress/data';
import { useContext, useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

/**
 * Internal dependencies
 */
import { SITE_STORE } from '../stores';
import LaunchContext from '../context';

export function useTitle() {
	const { siteId } = useContext( LaunchContext );
	const title = useSelect( ( select ) => select( SITE_STORE ).getSiteTitle( siteId ) );
	const [ localStateTitle, setLocalStateTitle ] = useState< string | undefined >( undefined );
	const saveSiteTitle = useDispatch( SITE_STORE ).saveSiteTitle;
	const [ debouncedSaveSiteTitle ] = useDebouncedCallback( saveSiteTitle, 1000 );

	const localStateTitleIsUndefined = typeof localStateTitle === 'undefined';

	useEffect( () => {
		if ( localStateTitleIsUndefined ) {
			return;
		}
		debouncedSaveSiteTitle( siteId, localStateTitle );
	}, [ localStateTitle, debouncedSaveSiteTitle, siteId, localStateTitleIsUndefined ] );

	return {
		title: localStateTitleIsUndefined ? title : localStateTitle,
		updateTitle: setLocalStateTitle,
	};
}
