import { localizeUrl } from '@automattic/i18n-utils';
import { useManageSupportInteraction } from '@automattic/odie-client/src/data/use-manage-support-interaction';
import { useCreateZendeskConversation } from '@automattic/odie-client/src/hooks';
import { useDispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { v4 as uuidv4 } from 'uuid';
import { useResetSupportInteraction } from './use-reset-support-interaction';

/**
 * Add your conditions here to open the Help Center automatically when they're met.
 */
export const useActionHooks = () => {
	const { setShowHelpCenter, setShowSupportDoc, setNavigateToRoute } =
		useDispatch( 'automattic/help-center' );
	const resetSupportInteraction = useResetSupportInteraction();
	const { startNewInteraction } = useManageSupportInteraction();
	const newConversation = useCreateZendeskConversation( true );
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
		 * Open Help Center.
		 */
		{
			condition() {
				return queryParams.get( 'help-center' ) === 'home';
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
				return queryParams.get( 'help-center' ) === 'wapuu';
			},
			action() {
				setNavigateToRoute( '/odie' );
				setShowHelpCenter( true );
			},
		},
		/**
		 * Open to Chat with Happiness Engineer.
		 */
		{
			condition() {
				return queryParams.get( 'help-center' ) === 'happiness-engineer';
			},
			async action() {
				await resetSupportInteraction();
				await startNewInteraction( {
					event_source: 'help-center',
					event_external_id: uuidv4(),
				} );
				setNavigateToRoute( '/odie' );
				await newConversation();
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
