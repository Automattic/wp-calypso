import { dispatch, useSelect } from '@wordpress/data';
import { useCallback } from 'react';

const HELP_CENTER_STORE = 'automattic/help-center';

const useShowHelpCenter = () => {
	const isShown = useSelect( ( select ) => !! select( HELP_CENTER_STORE )?.isHelpCenterShown?.() );

	const setShowHelpCenter = useCallback( async ( show: boolean ) => {
		if ( ! dispatch( HELP_CENTER_STORE ) ) {
			const { HelpCenter: HelpCenterStore } = await import( '@automattic/data-stores' );
			HelpCenterStore.register();
		}

		dispatch( HELP_CENTER_STORE ).setShowHelpCenter( show );
	}, [] );

	return [ isShown, setShowHelpCenter ];
};

export default useShowHelpCenter;
