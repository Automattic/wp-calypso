import { HelpCenterSelect } from '@automattic/data-stores';
import { localizeUrl } from '@automattic/i18n-utils';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { HELP_CENTER_STORE } from '../stores';

/**
 * Add your conditions here to open the Help Center automatically when they're met.
 */
export const useActionHooks = () => {
	const { setShowHelpCenter, setShowSupportDoc, setNavigateToRoute, setNewMessagingChat } =
		useDispatch( 'automattic/help-center' );
	const queryParams = new URLSearchParams( window.location.search );

	const helpCenterRouterHistory = useSelect(
		( select ) => ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).getHelpCenterRouterHistory(),
		[]
	);

	// Wait until the Help Center persisted state is loaded.
	const isResolving = useSelect(
		( select ) =>
			( select( HELP_CENTER_STORE ) as HelpCenterSelect ).isResolving( 'isHelpCenterShown' ),
		[]
	);

	const areDependenciesLoading = isResolving;

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
			async action() {
				const { entries, index } = helpCenterRouterHistory ?? { entries: [], index: 0 };
				const lastEntry = entries[ index ];
				// Don't override the user persisted history if they're already on the Odie page.
				if ( lastEntry?.pathname !== '/odie' ) {
					setNavigateToRoute( '/odie' );
					setShowHelpCenter( true );
				}
			},
		},

		/**
		 * Open to Chat with Happiness Engineer.
		 */
		{
			condition() {
				return queryParams.get( 'help-center' ) === 'happiness-engineer';
			},
			action() {
				setNewMessagingChat( {
					initialMessage: queryParams.get( 'user-message' ) ?? '',
					siteUrl: queryParams.get( 'site-url' ) ?? '',
					siteId: queryParams.get( 'site-id' ) ?? '',
				} );
			},
		},
	];

	useEffect( () => {
		if ( areDependenciesLoading ) {
			return;
		}
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
	}, [ areDependenciesLoading ] );
};
