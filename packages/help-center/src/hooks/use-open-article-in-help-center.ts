import { useDispatch } from '@wordpress/data';
import { HELP_CENTER_STORE } from '../stores';

export const useOpenArticleInHelpCenter = () => {
	const helpCenterDispatch = useDispatch( HELP_CENTER_STORE );
	const setShowHelpCenter = helpCenterDispatch?.setShowHelpCenter;
	const setNavigateToRoute = helpCenterDispatch?.setNavigateToRoute;

	const openArticleInHelpCenter = ( articleLink: string ) => {
		if ( setShowHelpCenter && setNavigateToRoute ) {
			const articleRoute = `/post/?link=${ articleLink }`;
			setNavigateToRoute( articleRoute );
			setShowHelpCenter( true );
		} else {
			// eslint-disable-next-line no-console
			console.warn( 'Help Center is not available' );
		}
	};

	return { openArticleInHelpCenter };
};
