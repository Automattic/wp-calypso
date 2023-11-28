import { localizeUrl } from '@automattic/i18n-utils';
import { useDispatch } from '@wordpress/data';

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

	return actionHooks;
};

export default useActionHooks;
