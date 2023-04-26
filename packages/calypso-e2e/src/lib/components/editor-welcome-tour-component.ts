import { Page, Locator } from 'playwright';
import { EXTENDED_EDITOR_WAIT_TIMEOUT } from '../pages/editor-page';

/**
 * Represents the welcome tour that shows in a popover when the editor loads.
 */
export class EditorWelcomeTourComponent {
	private page: Page;
	private editor: Locator;

	/**
	 * Creates an instance of the component.
	 *
	 * @param {Page} page Object representing the base page.
	 * @param {Locator} editor Frame-safe locator to the editor.
	 */
	constructor( page: Page, editor: Locator ) {
		this.page = page;
		this.editor = editor;
	}

	/**
	 * Force shows or dismisses the welcome tour using Redux state/actions.
	 *
	 * @see {@link https://github.com/Automattic/wp-calypso/issues/57660}
	 */
	async forceToggleWelcomeTour( show = true ): Promise< void > {
		// Locator API doesn't have waitForFunction yet. We need a Frame for now.
		const editorElement = await this.editor.elementHandle( {
			timeout: EXTENDED_EDITOR_WAIT_TIMEOUT,
		} );
		const editorFrame = await editorElement?.ownerFrame();
		if ( ! editorFrame ) {
			return;
		}

		await editorFrame.waitForFunction( async () => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const welcomeGuide = ( window as any )?.wp?.data?.select( 'automattic/wpcom-welcome-guide' );

			if ( typeof welcomeGuide?.isWelcomeGuideStatusLoaded !== 'function' ) {
				return false;
			}

			return await welcomeGuide.isWelcomeGuideStatusLoaded();
		} );

		await editorFrame.waitForFunction( async ( show ) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const welcomeGuide = ( window as any )?.wp?.data?.dispatch(
				'automattic/wpcom-welcome-guide'
			);

			if ( typeof welcomeGuide?.setShowWelcomeGuide !== 'function' ) {
				return false;
			}

			const actionPayload = await welcomeGuide.setShowWelcomeGuide( show );

			return actionPayload.show === show;
		}, show );
	}

	/**
	 * Force shows the welcome tour using Redux state/actions.
	 */
	async forceShowWelcomeTour(): Promise< void > {
		await this.forceToggleWelcomeTour( true );
	}

	/**
	 * Force dismisses the welcome tour using Redux state/actions.
	 */
	async forceDismissWelcomeTour(): Promise< void > {
		await this.forceToggleWelcomeTour( false );
	}
}
