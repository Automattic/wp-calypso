import { dispatch } from '@wordpress/data';
import { useCallback } from 'react';

let HELP_CENTER_STORE: string;

const useSetShowHelpCenter = () => {
	return useCallback( async ( show: boolean ) => {
		if ( ! HELP_CENTER_STORE ) {
			const { HelpCenter: HelpCenterStore } = await import( '@automattic/data-stores' );
			HELP_CENTER_STORE = HelpCenterStore.register();
		}

		const { setShowHelpCenter } = dispatch( HELP_CENTER_STORE );
		setShowHelpCenter( show );
	}, [] );
};

export default useSetShowHelpCenter;
