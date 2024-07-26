import { HelpCenter } from '@automattic/data-stores';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';

const HELP_CENTER_STORE = HelpCenter.register();

export const useOpenArticleInHelpCenter = () => {
	const helpCenterDispatch = useDataStoreDispatch( HELP_CENTER_STORE );
	const setShowHelpCenter = helpCenterDispatch?.setShowHelpCenter;
	const setNavigateToRoute = helpCenterDispatch?.setNavigateToRoute;

	const openArticleInHelpCenter = ( articleLink: string ) => {
		if ( setShowHelpCenter && setNavigateToRoute ) {
			setNavigateToRoute( articleLink );
			setShowHelpCenter( true );
		} else {
			// eslint-disable-next-line no-console
			console.warn( 'Help Center is not available' );
		}
	};

	return { openArticleInHelpCenter };
};
