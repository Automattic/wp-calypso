import { dispatch, useSelect } from '@wordpress/data';
import { useCallback, useState, useRef } from 'react';

const HELP_CENTER_STORE = 'automattic/help-center';

export function useHelpCenter() {
	const loadingPromiseRef = useRef< Promise< unknown > >();
	const [ isLoading, setIsLoading ] = useState( false );
	const isShown = useSelect(
		( select ) =>
			!! (
				select( HELP_CENTER_STORE ) as import('@automattic/data-stores').HelpCenterSelect
			 )?.isHelpCenterShown?.(),
		[ isLoading ] // We need to re-evaluate this incase a component used the hook before the store was loaded.
	);

	// Load `@automattic/data-stores` asynchronously to avoid including it in the main bundle and reduce initial load size.
	async function ensureHelpCenterLoaded() {
		if ( dispatch( HELP_CENTER_STORE ) ) {
			return Promise.resolve();
		}

		if ( loadingPromiseRef.current ) {
			return loadingPromiseRef.current;
		}

		setIsLoading( true );
		loadingPromiseRef.current = import(
			/* webpackChunkName: "async-load-automattic-data-stores" */ '@automattic/data-stores'
		).then( ( { HelpCenter: HelpCenterStore } ) => {
			HelpCenterStore.register();
			setIsLoading( false );
			loadingPromiseRef.current = undefined;
		} );

		return loadingPromiseRef.current;
	}

	const setShowHelpCenter = useCallback( async ( show: boolean ) => {
		await ensureHelpCenterLoaded();

		return (
			dispatch(
				HELP_CENTER_STORE
			) as import('@automattic/data-stores').HelpCenterDispatch[ 'dispatch' ]
		 ).setShowHelpCenter( show );
	}, [] );

	const setNavigateToRoute = useCallback( async ( route?: string ) => {
		await ensureHelpCenterLoaded();

		return (
			dispatch(
				HELP_CENTER_STORE
			) as import('@automattic/data-stores').HelpCenterDispatch[ 'dispatch' ]
		 ).setNavigateToRoute( route );
	}, [] );

	const setSubject = useCallback( async ( subject: string ) => {
		await ensureHelpCenterLoaded();

		return (
			dispatch(
				HELP_CENTER_STORE
			) as import('@automattic/data-stores').HelpCenterDispatch[ 'dispatch' ]
		 ).setSubject( subject );
	}, [] );

	return {
		isLoading,
		isShown,
		setShowHelpCenter,
		setNavigateToRoute,
		setSubject,
	};
}
