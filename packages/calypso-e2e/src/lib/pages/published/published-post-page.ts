import { Page } from 'playwright';

const selectors = {
	// Post body
	postBody: '.entry-content',
	postPasswordInput: 'input[name="post_password"]',
	submitPasswordButton: 'input[name="Submit"]',

	// Like Widget
	likeWidget: 'iframe[title="Like or Reblog"]',
	likeButton: 'a.like',
	unlikeButton: 'a.liked',
	likedText: 'text=Liked',
	notLikedText: 'text=Like',
};

/**
 * Represents the published site's post listings page.
 */
export class PublishedPostPage {
	private page: Page;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
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
	 * Clicks the Like button on the post.
	 *
	 * This method will also confirm that click action on the Like button
	 * had the intended effect.
	 */
	async likePost(): Promise< void > {
		const locator = this.page
			.frameLocator( 'iframe[title="Like or Reblog"]' )
			.getByRole( 'link', { name: 'Like' } );

		// On AT sites Playwright is not able to scroll directly to the iframe
		// containing the Like/Unlike button (similar to Post Comments).
		await locator.evaluate( ( element ) => element.scrollIntoView() );

		await locator.click();

		// The button should now read "Liked".
		await this.page
			.frameLocator( 'iframe[title="Like or Reblog"]' )
			.getByRole( 'link', { name: 'Liked' } )
			.waitFor();
	}

	/**
	 * Clicks the already-liked Like button on the post to unlike.
	 *
	 * This method will also confirm that click action on the Like button
	 * had the intended effect.
	 */
	async unlikePost(): Promise< void > {
		const locator = this.page
			.frameLocator( 'iframe[title="Like or Reblog"]' )
			.getByRole( 'link', { name: 'Liked' } );

		// On AT sites Playwright is not able to scroll directly to the iframe
		// containing the Like/Unlike button (similar to Post Comments).
		await locator.evaluate( ( element ) => element.scrollIntoView() );

		await locator.click();

		// The button should now read "Like".
		await this.page
			.frameLocator( 'iframe[title="Like or Reblog"]' )
			.getByRole( 'link', { name: 'Like' } )
			.waitFor();
	}

	/**
	 * Validates that the title is as expected.
	 *
	 * @param {string} title Title text to check.
	 */
	async validateTitle( title: string ): Promise< void > {
		const dash = /-/g;
		title = title.replace( dash, '–' );
		await this.page.waitForSelector( `:text("${ title }")` );
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
}
