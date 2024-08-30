import { useDispatch } from '@wordpress/data';
import { HELP_CENTER_STORE } from '../stores';

export const useOpenArticleInHelpCenter = () => {
	const helpCenterDispatch = useDispatch( HELP_CENTER_STORE );
	const setShowSupportDoc = helpCenterDispatch?.setShowSupportDoc;

	const openArticleInHelpCenter = ( articleLink: string ) => {
		if ( setShowSupportDoc ) {
			setShowSupportDoc( articleLink );
		} else {
			// eslint-disable-next-line no-console
			console.warn( 'Help Center is not available' );
		}
	};

	return { openArticleInHelpCenter };
};
