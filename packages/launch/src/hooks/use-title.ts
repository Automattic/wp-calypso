/**
 * External dependencies
 */
import { useDispatch, useSelect } from '@wordpress/data';
import { useContext, useEffect, useState } from 'react';

/**
 * Internal dependencies
 */
import { SITE_STORE, LAUNCH_STORE } from '../stores';
import LaunchContext from '../context';

export function useTitle() {
	const { siteId } = useContext( LaunchContext );
	const title = useSelect( ( select ) => select( SITE_STORE ).getSiteTitle( siteId ) );
	const [ localStateTitle, setLocalStateTitle ] = useState< string >( title || '' );

	useEffect( () => {
		setLocalStateTitle( title || '' );
	}, [ title ] );

	const saveSiteTitle = useDispatch( SITE_STORE ).saveSiteTitle;

	const isSiteTitleStepVisible = useSelect( ( select ) =>
		select( LAUNCH_STORE ).isSiteTitleStepVisible()
	);

	const showSiteTitleStep = useDispatch( LAUNCH_STORE ).showSiteTitleStep;

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
		isSiteTitleStepVisible,
		showSiteTitleStep,
	};
}
