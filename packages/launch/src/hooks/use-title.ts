/**
 * External dependencies
 */
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useState } from 'react';

/**
 * Internal dependencies
 */
import { SITE_STORE } from '../stores';

export function useTitle( siteId: number ) {
	const title = useSelect( ( select ) => select( SITE_STORE ).getSite( siteId ) )?.name;
	const [ localStateTitle, setLocalStateTitle ] = useState< string >( title || '' );

	useEffect( () => {
		setLocalStateTitle( title || '' );
	}, [ title ] );

	const saveSiteTitle = useDispatch( SITE_STORE ).saveSiteTitle;

	return {
		title: localStateTitle,
		updateTitle: setLocalStateTitle,
		saveTitle: () => {
			// if saveTitle is called before the original title is fetched, it is a noop
			// this is needed to make sure not to overwrite the original title by calling saveTitle too early
			if ( typeof title === 'undefined' ) {
				return;
			}
			saveSiteTitle( siteId, localStateTitle );
		},
	};
}
