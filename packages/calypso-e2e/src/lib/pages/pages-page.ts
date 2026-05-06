import { Page, Response } from 'playwright';
import { getCalypsoURL } from '../../data-helper';

const selectors = {
	// General
	addNewPageButton: 'a.page-title-action, span.split-page-title-action>a',
};

/**
 * Represents the Pages page
 */
export class PagesPage {
	private page: Page;

	/**
	 * Creates an instance of the page.
	 *
	 * @param {Page} page Object representing the base page.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Opens the Pages page.
	 *
	 * Example {@link https://wordpress.com/pages}
	 */
	async visit( { siteSlug = '' }: { siteSlug?: string } = {} ): Promise< Response | null > {
		const response = await this.page.goto( getCalypsoURL( 'pages' ) );

		if ( siteSlug ) {
			const siteLink = this.page.locator( `a:has-text("${ siteSlug }")` ).first();
			const appeared = await siteLink
				.waitFor( { state: 'visible', timeout: 5000 } )
				.then( () => true )
				.catch( () => false );

			if ( appeared ) {
				await siteLink.click( { noWaitAfter: true } );
				await this.page.waitForFunction(
					() => /\/pages\/|\/wp-admin\/edit\.php|\/home\//.test( window.location.pathname ),
					undefined,
					{ timeout: 20 * 1000 }
				);
			}

			if ( /\/home\//.test( new URL( this.page.url() ).pathname ) ) {
				await this.page.goto( getCalypsoURL( `pages/${ siteSlug }` ), {
					timeout: 30 * 1000,
					waitUntil: 'domcontentloaded',
				} );
			}
		}

		return response;
	}

	/**
	 * Start a new page using the 'Add new page' button.
	 */
	async addNewPage( { siteSlug = '' }: { siteSlug?: string } = {} ): Promise< void > {
		const locator = this.page.locator( selectors.addNewPageButton );

		const hasPageEditorUrl = (): boolean => {
			const u = new URL( this.page.url() );
			if ( /^\/page(?:\/[^/?#]+)?\/?$/.test( u.pathname ) ) {
				return true;
			}
			if (
				u.pathname === '/wp-admin/post-new.php' &&
				u.searchParams.get( 'post_type' ) === 'page'
			) {
				return true;
			}
			return false;
		};

		const addNewVisible = await locator
			.first()
			.waitFor( { state: 'visible', timeout: 5000 } )
			.then( () => true )
			.catch( () => false );

		if ( addNewVisible ) {
			await Promise.all( [
				this.page.waitForFunction(
					() => {
						const u = new URL( window.location.href );
						if ( /^\/page(?:\/[^/?#]+)?\/?$/.test( u.pathname ) ) {
							return true;
						}
						if (
							u.pathname === '/wp-admin/post-new.php' &&
							u.searchParams.get( 'post_type' ) === 'page'
						) {
							return true;
						}
						return false;
					},
					undefined,
					{ timeout: 20 * 1000 }
				),
				locator.click( { noWaitAfter: true } ),
			] );
		} else if ( siteSlug ) {
			await this.page.goto( getCalypsoURL( `page/${ siteSlug }` ), {
				timeout: 30 * 1000,
				waitUntil: 'domcontentloaded',
			} );
		}

		if ( ! hasPageEditorUrl() ) {
			throw new Error( `Expected to navigate to a page editor route, got ${ this.page.url() }` );
		}
	}
}
