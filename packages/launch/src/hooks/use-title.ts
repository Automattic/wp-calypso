/**
 * External dependencies
 */
import { useDispatch, useSelect } from '@wordpress/data';
import { useState } from 'react';

/**
 * Internal dependencies
 */
import { SITE_STORE } from '../stores';

export function useTitle( siteId: number ) {
	const title = useSelect( ( select ) => select( SITE_STORE ).getSiteTitle( siteId ) );
	const [ localStateTitle, setLocalStateTitle ] = useState( title );
	const saveSiteTitle = useDispatch( SITE_STORE ).saveSiteTitle;

	return {
		title: localStateTitle,
		updateTitle: setLocalStateTitle,
		saveTitle: () => saveSiteTitle( siteId, localStateTitle ),
	};
}
