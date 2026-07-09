import { Locator, Page } from 'playwright';
import { waitForWPWidgetsIfNecessary } from '../../../element-helper';

const selectors = {
	// Post body
	postPasswordInput: 'input[name="post_password"]',

	// Published content
	socialShareSection: '.sharedaddy',

	// WordPress.com EU cookie-law consent notice. On mobile viewports it is
	// pinned to the bottom of the screen and overlays the Like widget, so it
	// must be dismissed before interacting with the widget. Targeted by CSS
	// rather than button text because the label is localized.
	cookieConsentAccept: '#eu-cookie-law .accept',
};

/**
 * Represents the published site's post listings page.
 */
export class PublishedPostPage {
	private page: Page;
	private anchor: Locator;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
		this.anchor = this.page.getByRole( 'main' );
	}

	/**
	 * Fills and submits the post password for password protected entries.
	 *
	 * @param {string} password Password to submit.
	 */
	async enterPostPassword( password: string ): Promise< void > {
		await this.page.fill( selectors.postPasswordInput, password );
		await Promise.all( [ this.page.waitForNavigation(), this.page.keyboard.press( 'Enter' ) ] );
	}

	/**
	 * Dismisses the site's cookie consent notice if it is present.
	 *
	 * On mobile viewports the notice is pinned to the bottom of the screen and
	 * can overlay the Like widget, intercepting clicks. It auto-hides after a
	 * timeout and only shows before consent is given, so a missing notice is
	 * not an error.
	 */
	async dismissCookieConsent(): Promise< void > {
		const locator = this.page.locator( selectors.cookieConsentAccept );
		try {
			await locator.waitFor( { state: 'visible', timeout: 3 * 1000 } );
		} catch {
			// Notice did not appear; nothing to dismiss.
			return;
		}
		await locator.click();
	}

	/**
	 * Clicks the Like button on the post, without asserting the outcome.
	 *
	 * For a logged-out visitor this click opens the WordPress.com login popup
	 * instead of registering the like.
	 */
	async clickLikeButton(): Promise< void > {
		await this.dismissCookieConsent();

		const iframeLocator = this.page.locator( 'iframe[title="Like or Reblog"]' );
		await iframeLocator.waitFor();

		// Wait for widgets.wp.com iframes to finish loading before interacting with them.
		await waitForWPWidgetsIfNecessary( this.page );

		const iframe = this.page.frameLocator( 'iframe[title="Like or Reblog"]' );
		const likeLocator = iframe.getByRole( 'link', { name: 'Like', exact: true } );
		await likeLocator.waitFor();

		// On AT sites Playwright is not able to scroll directly to the iframe
		// containing the Like/Unlike button (similar to Post Comments).
		await iframeLocator.scrollIntoViewIfNeeded();
		// Use evaluate to scroll the button into view since it's inside an iframe.
		await likeLocator.evaluate( ( element ) => element.scrollIntoView() );

		await likeLocator.click();
	}

	/**
	 * Clicks the Like button on the post and confirms the "Liked" state.
	 *
	 * For a logged-out visitor, pass `handleLoginPopup` to complete the
	 * WordPress.com login that the first click opens. The widget registers the
	 * like on its own once that login handshake finishes, so the "Liked"
	 * confirmation is given extra time in that case.
	 *
	 * @param {Object} [options] Keyed options.
	 * @param {Function} [options.handleLoginPopup] Handler that authenticates
	 * the login popup opened by the initial, logged-out Like click.
	 */
	async likePost( {
		handleLoginPopup,
	}: { handleLoginPopup?: ( popup: Page ) => Promise< void > } = {} ): Promise< void > {
		if ( handleLoginPopup ) {
			const popupPromise = this.page.waitForEvent( 'popup' );
			await this.clickLikeButton();
			await handleLoginPopup( await popupPromise );
		} else {
			await this.clickLikeButton();
		}

		// The button should now read "Liked". The popup login handshake can run
		// long, so allow extra time before the widget reflects the like.
		const iframe = this.page.frameLocator( 'iframe[title="Like or Reblog"]' );
		await iframe
			.getByRole( 'link', { name: 'Liked', exact: true } )
			.waitFor( { timeout: handleLoginPopup ? 30 * 1000 : undefined } );
	}

	/**
	 * Clicks the already-liked Like button on the post to unlike.
	 *
	 * This method will also confirm that click action on the Like button
	 * had the intended effect.
	 */
	async unlikePost(): Promise< void > {
		await this.dismissCookieConsent();

		const iframeLocator = this.page.locator( 'iframe[title="Like or Reblog"]' );
		await iframeLocator.waitFor();

		// Wait for widgets.wp.com iframes to finish loading before interacting with them.
		await waitForWPWidgetsIfNecessary( this.page );

		const iframe = this.page.frameLocator( 'iframe[title="Like or Reblog"]' );
		const locator = iframe.getByRole( 'link', { name: 'Liked', exact: true } );
		await locator.waitFor();

		// On AT sites Playwright is not able to scroll directly to the iframe
		// containing the Like/Unlike button (similar to Post Comments).
		await iframeLocator.scrollIntoViewIfNeeded();
		// Use evaluate to scroll the button into view since it's inside an iframe.
		await locator.evaluate( ( element ) => element.scrollIntoView() );

		await locator.click();

		// The button should now read "Like".
		await iframe.getByRole( 'link', { name: 'Like', exact: true } ).waitFor();
	}

	/**
	 * Fills out a subscription form on the published post with the supplied
	 * email address, and confirms the subscription.
	 *
	 * Note that this method currently only handles Free subscriptions.
	 *
	 * @param {string} email Email address to subscribe.
	 */
	async subscribe( email: string ) {
		await this.anchor.getByPlaceholder( /type your email/i ).fill( email );
		await this.anchor.getByRole( 'button', { name: 'Subscribe' } ).click();

		// The popup dialog is in its own iframe.
		const iframe = this.page.frameLocator( 'iframe[id="memberships-modal-iframe"]' );

		// This handler is required because if the site owner has set up any
		// paid plans, the modal will first show a list of plans the user
		// can choose from.
		// However, we don't know for sure whether a site owner has set up any
		// newsletter plans.
		const continueButton = iframe.getByRole( 'button', { name: 'Got it', exact: true } );
		const freeTrialLink = iframe.getByRole( 'link', {
			name: 'Free - Get a glimpse of the newsletter',
		} );

		await continueButton.or( freeTrialLink ).waitFor();
		if ( await freeTrialLink.isVisible() ) {
			await freeTrialLink.click();
		}

		await continueButton.click();
	}

	/**
	 * Validates that the title is as expected.
	 *
	 * @param {string} title Title text to check.
	 */
	async validateTitle( title: string ) {
		// The dash is used in the title of the published post is
		// not a "standard" dash, instead being U+2013.
		// We have to replace any expectatiosn of "normal" dashes
		// with the U+2013 version, otherwise the match will fail.
		const sanitizedTitle = title.replace( /-/g, '–' );
		await this.anchor.getByRole( 'heading', { name: sanitizedTitle } ).waitFor();
	}

	/**
	 * Validates that the provided text can be found in the post page. Throws if it isn't.
	 *
	 * @param {string} text Text to search for in post page
	 */
	async validateTextInPost( text: string ): Promise< void > {
		const splitString = text.split( '\n' );
		const dash = /-/;
		for await ( let line of splitString ) {
			// Sanitize the string and replace U+002d (hyphen/dash)
			// with U+2013 (em dash) if the paragraph starts with a dash.
			// Note that dashes found outside of leading position are
			// not impacted.
			// https://make.wordpress.org/docs/style-guide/punctuation/dashes/
			if ( line.search( dash ) === 0 ) {
				line = line.replace( dash, '–' );
			}
			await this.page.waitForSelector( `:text("${ line }"):visible` );
		}
	}

	/**
	 * Validates that the category has been added to the article.
	 *
	 * @param {string} category Category to validate on page.
	 */
	async validateCategory( category: string ): Promise< void > {
		await this.page.waitForSelector( `a:text-is("${ category }")` );
	}

	/**
	 * Validates that the tag has been added to the article.
	 *
	 * @param {string} tag Tag to validate on page.
	 */
	async validateTags( tag: string ): Promise< void > {
		await this.page.waitForSelector( `a:text-is("${ tag }")` );
	}

	/**
	 * Validates the presence of a social sharing button on the published content.
	 *
	 * If optional parameter `click` is set, the button will be clicked to verify
	 * functionality.
	 *
	 * @param {string} name Name of the social sharing button.
	 */
	async validateSocialButton( name: string, { click }: { click?: boolean } = {} ) {
		// CSS selector have to be used due to no accessible locator for narrowing
		// to the social icons.
		const button = this.anchor
			.locator( selectors.socialShareSection )
			.getByRole( 'link', { name: name } );

		await button.waitFor();

		if ( click ) {
			const popupPromise = this.page.waitForEvent( 'popup' );
			await button.click();
			const popup = await popupPromise;
			await popup.waitForLoadState( 'load' );
			await popup.close();
		}
	}
}
