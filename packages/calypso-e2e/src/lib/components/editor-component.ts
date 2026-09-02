import { Page, Locator } from 'playwright';
import envVariables from '../../env-variables';
import { completeJetpackSso } from '../pages/wp-admin/jetpack-sso';

const EDITOR_TIMEOUT = 60 * 1000;

// The SSO screen is the slow path: it is what a loaded Atomic site answers with when the two
// waits below are already doomed. Giving it the same budget as its competitors makes it lose a
// race it is meant to win — `Promise.any` rejects once all three are out, so a screen arriving
// after EDITOR_TIMEOUT is never clicked. It must outlive them.
const JETPACK_SSO_SCREEN_TIMEOUT = 2 * EDITOR_TIMEOUT;

/**
 * Represents the Editor component.
 */
export class EditorComponent {
	private page: Page;
	private parentLocator: Locator | null;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
		this.parentLocator = null;
	}

	/**
	 * Returns the Editor parent locator. It will automatically resolve to the
	 * proper locator, regardless if the Editor is Gutenframed or not.
	 */
	async parent(): Promise< Locator > {
		if ( this.parentLocator ) {
			return this.parentLocator;
		}

		const waits = [ this.waitForFramedEditor(), this.waitForUnframedEditor() ];

		// Only Atomic wp-admin can answer with the SSO screen. Elsewhere this racer would
		// just hold a wp-login.php wait open for the full timeout after the editor loaded.
		if ( envVariables.TEST_ON_ATOMIC ) {
			waits.push( this.waitForEditorBehindJetpackSso() );
		}

		try {
			this.parentLocator = await Promise.any( waits );
		} catch {
			throw new Error( 'Timed out waiting for the Editor' );
		}

		return this.parentLocator;
	}

	/**
	 * Returns the Editor canvas locator. It will automatically resolve to the
	 * proper locator, regardless if the canvas is iframed or not.
	 *
	 * Note: unlike the Editor parent, the canvas can switch between iframed and
	 * non-iframed within a single session — e.g. inserting a block that doesn't
	 * support the iframed canvas (such as Layout Grid or Blog Posts) de-iframes
	 * it. The result is therefore re-detected on every call and never cached.
	 */
	async canvas(): Promise< Locator > {
		try {
			return await Promise.any( [ this.waitForFramedCanvas(), this.waitForUnframedCanvas() ] );
		} catch {
			throw new Error( 'Timed out waiting for the Editor canvas' );
		}
	}

	/**
	 * If wp-admin answered with the Jetpack SSO screen, it will clear the screen and resolve
	 * with the parent element locator once the Editor loads behind it. Otherwise, it will
	 * time out.
	 *
	 * Atomic sites carrying local users serve this screen in place of the Editor. It arrives
	 * after Calypso has redirected away from its own route, so no navigation the caller made
	 * can check for it, and the two waits above see only a page that never becomes an Editor.
	 * Racing it alongside them is what catches it; on the common path this branch simply loses
	 * and `Promise.any` ignores it.
	 *
	 * The cost of the longer budget is paid only when the Editor never loads at all: that
	 * failure now takes JETPACK_SSO_SCREEN_TIMEOUT to report instead of EDITOR_TIMEOUT.
	 */
	private async waitForEditorBehindJetpackSso() {
		// Keyed on the URL, not on the link: the two waits above race this one and only one of
		// the three may touch the page, so this branch must not act until the screen is
		// certain.
		await this.page.waitForURL( /wp-login\.php/, { timeout: JETPACK_SSO_SCREEN_TIMEOUT } );
		await completeJetpackSso( this.page );

		return await this.waitForUnframedEditor();
	}

	/**
	 * If the Editor is gutenframed, it will resolve with the parent element
	 * locator inside the Gutenframe once it's ready. Otherwise, it will time
	 * out.
	 */
	private async waitForFramedEditor() {
		const parentLocator = this.page
			.frameLocator( 'iframe[src*="calypsoify"]' )
			.locator( 'body.block-editor-page' );

		await parentLocator.waitFor( { timeout: EDITOR_TIMEOUT } );
		return parentLocator;
	}

	/**
	 * If the Editor is NOT gutenframed, it will resolve with the parent element
	 * locator inside the main frame. Otherwise, it will time out.
	 */
	private async waitForUnframedEditor() {
		const parentLocator = this.page.locator( 'body.block-editor-page' );

		await parentLocator.waitFor( { timeout: EDITOR_TIMEOUT } );
		return parentLocator;
	}

	/**
	 * If the Editor canvas is iframed, it will resolve with the parent element
	 * locator inside that iframe once it's ready. Otherwise, it will time out.
	 */
	private async waitForFramedCanvas() {
		const parentLocator = await this.parent();
		const canvasLocator = parentLocator
			.locator( '.editor-visual-editor' )
			.first()
			.frameLocator( 'iframe' )
			.locator( '.editor-styles-wrapper' );

		await canvasLocator.waitFor( { timeout: EDITOR_TIMEOUT } );
		return canvasLocator;
	}

	/**
	 * If the Editor canvas is NOT iframed, it will resolve with the canvas
	 * element locator inside the current Editor parent once it's ready.
	 * Otherwise, it will time out.
	 */
	private async waitForUnframedCanvas() {
		const parentLocator = await this.parent();
		const canvasWrapper = parentLocator.locator( '.editor-styles-wrapper' );
		await canvasWrapper.waitFor();

		return parentLocator;
	}
}
