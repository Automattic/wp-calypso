import { localizeUrl } from '@automattic/i18n-utils';
import { useDispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';

/**
 * Add your conditions here to open the Help Center automatically when they're met.
 */
const useActionHooks = () => {
	const { setShowHelpCenter, setShowSupportDoc } = useDispatch( 'automattic/help-center' );

	const actionHooks = [
		{
			condition() {
				return (
					new URLSearchParams( window.location.search ).get( 'help-center' ) === 'subscribe-block'
				);
			},
			action() {
				setShowHelpCenter( true );
				setShowSupportDoc(
					localizeUrl( 'https://wordpress.com/support/wordpress-editor/blocks/subscribe-block/' ),
					170164 // post id of subscribe block support doc page
				);
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

export default useActionHooks;
