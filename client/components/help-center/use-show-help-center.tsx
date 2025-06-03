import { dispatch, useSelect } from '@wordpress/data';
import { useCallback } from 'react';
import type { HelpCenterDispatch, HelpCenterSelect } from '@automattic/data-stores';

const HELP_CENTER_STORE = 'automattic/help-center';

const useShowHelpCenter = (): [ boolean, ( show: boolean ) => Promise< void > | void ] => {
	const isShown = useSelect(
		( select ) => !! ( select( HELP_CENTER_STORE ) as HelpCenterSelect )?.isHelpCenterShown?.(),
		[]
	);

	const setShowHelpCenter = useCallback( async ( show: boolean ) => {
		// Load `@automattic/data-stores` asynchronously to avoid including it in the main bundle and reduce initial load size.
		if ( ! dispatch( HELP_CENTER_STORE ) ) {
			const { HelpCenter: HelpCenterStore } = await import( '@automattic/data-stores' );
			HelpCenterStore.register();
		}

		( dispatch( HELP_CENTER_STORE ) as HelpCenterDispatch[ 'dispatch' ] ).setShowHelpCenter( show );
	}, [] );

	return [ isShown, setShowHelpCenter ];
};

export default useShowHelpCenter;
