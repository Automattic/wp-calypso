import { dispatch, useSelect } from '@wordpress/data';
import { useCallback, useState } from 'react';
import type { HelpCenterDispatch, HelpCenterSelect } from '@automattic/data-stores';

const HELP_CENTER_STORE = 'automattic/help-center';

const useShowHelpCenter = () => {
	const [ isLoading, setIsLoading ] = useState( false );
	const isShown = useSelect(
		( select ) => !! ( select( HELP_CENTER_STORE ) as HelpCenterSelect )?.isHelpCenterShown?.(),
		[]
	);

	const setShowHelpCenter = useCallback( async ( show: boolean ) => {
		// Load `@automattic/data-stores` asynchronously to avoid including it in the main bundle and reduce initial load size.
		if ( ! dispatch( HELP_CENTER_STORE ) ) {
			setIsLoading( true );
			const { HelpCenter: HelpCenterStore } = await import(
				/* webpackChunkName: "async-load-automattic-data-stores" */ '@automattic/data-stores'
			);
			HelpCenterStore.register();
			setIsLoading( false );
		}

		( dispatch( HELP_CENTER_STORE ) as HelpCenterDispatch[ 'dispatch' ] ).setShowHelpCenter( show );
	}, [] );

	return {
		isLoading,
		isShown,
		setShowHelpCenter,
	};
};

export default useShowHelpCenter;
