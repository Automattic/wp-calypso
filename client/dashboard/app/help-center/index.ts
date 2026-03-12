import { dispatch, useSelect } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { useCallback, useState, useRef } from 'react';
// eslint-disable-next-line no-restricted-imports
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

	const setNewMessagingChat = useCallback(
		async ( {
			initialMessage,
			section,
			siteUrl,
			siteId,
		}: {
			initialMessage: string;
			section?: string;
			siteUrl?: string;
			siteId?: string;
		} ) => {
			const url = addQueryArgs( '/odie', {
				provider: 'zendesk',
				userFieldMessage: initialMessage,
				section,
				siteUrl,
				siteId,
			} );
			await setNavigateToRoute( url );
			await setShowHelpCenter( true );
		},
		[ setNavigateToRoute, setShowHelpCenter ]
	);

	const setOpenOdieWithContext = useCallback(
		async ( {
			initialMessage,
			section,
			siteUrl,
			siteId,
		}: {
			initialMessage: string;
			section?: string;
			siteUrl?: string;
			siteId?: string | number;
		} ) => {
			const url = addQueryArgs( '/odie', {
				userFieldMessage: initialMessage,
				section,
				siteUrl,
				siteId: siteId != null ? String( siteId ) : undefined,
			} );
			await setNavigateToRoute( url );
			await setShowHelpCenter( true );
		},
		[ setNavigateToRoute, setShowHelpCenter ]
	);

	return {
		isLoading,
		isShown,
		setShowHelpCenter,
		setNavigateToRoute,
		setSubject,
		setNewMessagingChat,
		setOpenOdieWithContext,
	};
}
