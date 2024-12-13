import { localizeUrl } from '@automattic/i18n-utils';
import { useDispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { isThisASupportArticleLink } from './use-content-filter';

/**
 * Add your conditions here to open the Help Center automatically when they're met.
 */
export const useActionHooks = () => {
	const { setShowHelpCenter, setShowSupportDoc, setNavigateToRoute } =
		useDispatch( 'automattic/help-center' );
	const queryParams = new URLSearchParams( window.location.search );
	const helpCenterParam = queryParams.get( 'help-center' ) || '';

	const actionHooks = [
		/**
		 * Open to the support doc for the Subscribe block.
		 */
		{
			condition() {
				return helpCenterParam === 'subscribe-block';
			},
			action() {
				setShowSupportDoc(
					localizeUrl( 'https://wordpress.com/support/wordpress-editor/blocks/subscribe-block/' )
				);
			},
		},
		/**
		 * Open to a specific support doc.
		 */
		{
			condition() {
				return isThisASupportArticleLink( helpCenterParam );
			},
			action() {
				setShowSupportDoc( helpCenterParam );
				setShowHelpCenter( true );
			},
		},
		/**
		 * Open Help Center.
		 */
		{
			condition() {
				return helpCenterParam === 'home';
			},
			action() {
				setShowHelpCenter( true );
			},
		},
		/**
		 * Open to Wapuu chat.
		 */
		{
			condition() {
				return helpCenterParam === 'wapuu';
			},
			action() {
				setNavigateToRoute( '/odie' );
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
