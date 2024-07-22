import { localizeUrl } from '@automattic/i18n-utils';
import { useDispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';

/**
 * Add your conditions here to open the Help Center automatically when they're met.
 */
export const useActionHooks = () => {
	const { setShowHelpCenter, setShowSupportDoc, setInitialRoute } =
		useDispatch( 'automattic/help-center' );
	const queryParams = new URLSearchParams( window.location.search );

	const actionHooks = [
		/**
		 * Open to the support doc for the Subscribe block.
		 */
		{
			condition() {
				return queryParams.get( 'help-center' ) === 'subscribe-block';
			},
			action() {
				setShowHelpCenter( true );
				setShowSupportDoc(
					localizeUrl( 'https://wordpress.com/support/wordpress-editor/blocks/subscribe-block/' ),
					170164 // post id of subscribe block support doc page
				);
			},
		},
		/**
		 * Open to Wapuu chat.
		 */
		{
			condition() {
				return queryParams.get( 'help-center' ) === 'wapuu';
			},
			action() {
				setInitialRoute( '/odie' );
				setShowHelpCenter( true );
			},
		},
	];

	useEffect( () => {
		const timeout = setTimeout( () => {
			actionHooks.forEach( ( actionHook ) => {
				if ( actionHook.condition() ) {
					actionHook.action();
				}
			} );
		}, 0 );
		return () => clearTimeout( timeout );
		// Only want to run this once
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );
};
