import { Page } from 'playwright';
import { EditorComponent } from './editor-component';

const selectors = {
	welcomeGuideWrapper: '.edit-post-welcome-guide',
	// Welcome guide
	welcomeGuideCloseButton: 'button[aria-label="Close"]',
};

/**
 * Represents the welcome guide that shows in a popover when the editor loads.
 */
export class EditorWelcomeGuideComponent {
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
	 * close the welcome guide if needed.
	 */
	async closeWelcomeGuideIfNeeded(): Promise< void > {
		const editorParent = await this.editor.parent();

		const welcomGuideWrapper = editorParent.locator( selectors.welcomeGuideWrapper );
		await welcomGuideWrapper.waitFor( { state: 'visible' } );

		const closeBtn = editorParent.locator( selectors.welcomeGuideCloseButton );
		await closeBtn.click();
	}

	/**
	 * Force showing of the welcome guide.
	 */
	async forceShowWelcomeGuide(): Promise< void > {
		const editorParent = await this.editor.parent();
		const editorFrame = await ( await editorParent.elementHandle() )?.ownerFrame();
		if ( ! editorFrame ) {
			return;
		}

		await editorFrame.waitForFunction( async () => {
			const editPostSelectors = ( window as any )?.wp?.data?.select( 'core/edit-post' );
			const editPostActions = ( window as any )?.wp?.data?.dispatch( 'core/edit-post' );

			if ( typeof editPostSelectors?.isFeatureActive !== 'function' ) {
				return false;
			}

			if ( typeof editPostActions?.toggleFeature !== 'function' ) {
				return false;
			}

			if ( ! editPostSelectors.isFeatureActive( 'welcomeGuide' ) ) {
				editPostActions.toggleFeature( 'welcomeGuide' );
			}

			return true;
		} );
	}
}
