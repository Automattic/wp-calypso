import { Page } from 'playwright';
import { EditorComponent } from './editor-component';

/**
 * Represents the welcome tour that shows in a popover when the editor loads.
 */
export class EditorWelcomeTourComponent {
	private page: Page;
	private editor: EditorComponent;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 * @param {EditorComponent} editor The EditorComponent instance.
	 */
	constructor( page: Page, editor: EditorComponent ) {
		this.page = page;
		this.editor = editor;
	}

	/**
	 * Force shows or dismisses the welcome tour using Redux state/actions.
	 *
	 * @see {@link https://github.com/Automattic/wp-calypso/issues/57660}
	 */
	async forceToggleWelcomeTour( show = true ): Promise< void > {
		const editorParent = await this.editor.parent();
		const editorFrame = await ( await editorParent.elementHandle() )?.ownerFrame();
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
