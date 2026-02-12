import { dispatch, useSelect } from '@wordpress/data';
import { useCallback, useState, useRef } from 'react';
import type {
	HelpCenterSelect,
	HelpCenterDispatch as HelpCenterDispatchObject,
} from '@automattic/data-stores';
import type { HelpCenterShowOptions } from '@automattic/data-stores/src/help-center/types'; // eslint-disable-line no-restricted-imports

type HelpCenterDispatch = HelpCenterDispatchObject[ 'dispatch' ];

const HELP_CENTER_STORE = 'automattic/help-center';

export function useHelpCenter() {
	const loadingPromiseRef = useRef< Promise< unknown > >();
	const [ isLoading, setIsLoading ] = useState( false );
	const isShown = useSelect(
		( select ) => !! ( select( HELP_CENTER_STORE ) as HelpCenterSelect )?.isHelpCenterShown?.(),
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
		loadingPromiseRef.current = import( '@automattic/data-stores' ).then(
			( { HelpCenter: HelpCenterStore } ) => {
				HelpCenterStore.register();
				setIsLoading( false );
				loadingPromiseRef.current = undefined;
			}
		);

		return loadingPromiseRef.current;
	}

	const setShowHelpCenter = useCallback(
		async ( show: boolean, options?: HelpCenterShowOptions, forceClose?: boolean ) => {
			await ensureHelpCenterLoaded();

			return ( dispatch( HELP_CENTER_STORE ) as HelpCenterDispatch ).setShowHelpCenter(
				show,
				options,
				forceClose
			);
		},
		[]
	);

	const setNavigateToRoute = useCallback( async ( route?: string ) => {
		await ensureHelpCenterLoaded();

		return ( dispatch( HELP_CENTER_STORE ) as HelpCenterDispatch ).setNavigateToRoute( route );
	}, [] );

	const setSubject = useCallback( async ( subject: string ) => {
		await ensureHelpCenterLoaded();

		return ( dispatch( HELP_CENTER_STORE ) as HelpCenterDispatch ).setSubject( subject );
	}, [] );

	return {
		isLoading,
		isShown,
		setShowHelpCenter,
		setNavigateToRoute,
		setSubject,
	};
}
