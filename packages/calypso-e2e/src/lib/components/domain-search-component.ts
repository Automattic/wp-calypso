import { Locator, Page, Request, Response } from 'playwright';
import { reloadAndRetry, waitForElementEnabled } from '../../element-helper';
import { flakeProbe } from '../flake-probe';

type CartResponseDiagnostic = {
	method: string;
	status: number;
	ok: boolean;
	url: string;
	products?: string[];
	errors?: string[];
	responseError?: string;
};

// ponytail: throwaway. The add-to-cart mutation runs a domain-availability
// pre-check (GET /domains/<name>/is-available) before POSTing to the cart. When
// that GET fails transiently the CTA flips to the error state, but the existing
// diagnostics only capture the shopping-cart POSTs, so the real failure is
// invisible. Captures the availability request too. Remove with flake-probe.ts.
type AvailabilityDiagnostic = {
	kind: 'response' | 'requestfailed';
	method: string;
	url: string;
	status?: number;
	ok?: boolean;
	durationMs?: number;
	failureText?: string;
	bodyError?: string;
};

const isShoppingCartResponse = ( response: Response ): boolean => {
	try {
		return new URL( response.url() ).pathname.includes( '/me/shopping-cart/' );
	} catch {
		return response.url().includes( '/me/shopping-cart/' );
	}
};

const isAvailabilityRequest = ( url: string ): boolean => {
	try {
		return new URL( url ).pathname.includes( '/is-available' );
	} catch {
		return url.includes( '/is-available' );
	}
};

const requestDurationMs = ( request: Request ): number | undefined => {
	const responseEnd = request.timing().responseEnd;
	return responseEnd >= 0 ? Math.round( responseEnd ) : undefined;
};

const normalizeText = ( value?: string | null ): string =>
	( value ?? '' ).replace( /\s+/g, ' ' ).trim();

const formatError = ( error: unknown ): string =>
	error instanceof Error ? error.message : String( error );

const summarizeCartResponse = async ( response: Response ): Promise< CartResponseDiagnostic > => {
	const diagnostic: CartResponseDiagnostic = {
		method: response.request().method(),
		status: response.status(),
		ok: response.ok(),
		url: response.url(),
	};

	const contentType = response.headers()[ 'content-type' ] ?? '';
	if ( ! contentType.includes( 'application/json' ) ) {
		return diagnostic;
	}

	try {
		const body = await response.json();

		if ( Array.isArray( body?.products ) ) {
			diagnostic.products = body.products
				.map( ( product: { product_slug?: string; meta?: string } ) =>
					[ product.product_slug, product.meta ].filter( Boolean ).join( ':' )
				)
				.slice( 0, 5 );
		}

		if ( Array.isArray( body?.messages?.errors ) ) {
			diagnostic.errors = body.messages.errors
				.map( ( error: { code?: string; message?: string } ) =>
					[ error.code, error.message ].filter( Boolean ).join( ': ' )
				)
				.slice( 0, 5 );
		}
	} catch ( error ) {
		diagnostic.responseError = formatError( error );
	}

	return diagnostic;
};

// ponytail: throwaway. Summarizes an availability GET response, including a
// short read of the JSON body's error fields when present. Remove with
// flake-probe.ts.
const summarizeAvailabilityResponse = async (
	response: Response
): Promise< AvailabilityDiagnostic > => {
	const diagnostic: AvailabilityDiagnostic = {
		kind: 'response',
		method: response.request().method(),
		url: response.url(),
		status: response.status(),
		ok: response.ok(),
		durationMs: requestDurationMs( response.request() ),
	};

	try {
		const body = await response.json();
		if ( body?.error || body?.message ) {
			diagnostic.bodyError = [ body.error, body.message ].filter( Boolean ).join( ': ' );
		}
	} catch ( error ) {
		diagnostic.bodyError = formatError( error );
	}

	return diagnostic;
};

// ponytail: throwaway. The availability GET can fail at the network layer
// (aborted/reset), which never emits a `response` event. Remove with
// flake-probe.ts.
const summarizeAvailabilityFailure = ( request: Request ): AvailabilityDiagnostic => ( {
	kind: 'requestfailed',
	method: request.method(),
	url: request.url(),
	durationMs: requestDurationMs( request ),
	failureText: request.failure()?.errorText ?? 'unknown',
} );

/**
 * Component for the domain search feature.
 *
 * This class applies to multiple locations within WordPress.com that displays a domain search component.
 * Examples:
 * 	- Upgrades > Domains
 * 	- Signup flow
 */
export class DomainSearchComponent {
	private page: Page;
	container?: Locator;
	readonly claimYourSpaceHeading: Locator;
	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page, container?: Locator ) {
		this.page = page;
		this.container = container;
		this.claimYourSpaceHeading = this.getContainer().getByRole( 'heading', {
			name: 'Claim your space on the web',
		} );
	}

	/**
	 * Gets the container locator.
	 *
	 * @returns {Locator} The container locator.
	 */
	private getContainer(): Page | Locator {
		return this.container ?? this.page;
	}

	/**
	 * Searches for a domain using the keyword.
	 *
	 * @param {string} keyword Keyword to use in domain search.
	 */
	async search( keyword: string ): Promise< void > {
		const container = this.getContainer();

		/**
		 *
		 * Closure to pass into the retry method.
		 *
		 * @param {Page} page Page object.
		 */
		async function searchDomainClosure( page: Page ): Promise< void > {
			// Capture the first suggestion's title before searching. If
			// suggestions are already visible (e.g. pre-populated from the
			// site slug), this lets us detect when React re-renders the list
			// with new results after the API response arrives.
			const firstListitem = container.getByRole( 'listitem' ).first();
			let previousTitle: string | null = null;
			if ( ( await firstListitem.count() ) > 0 ) {
				previousTitle = await firstListitem.getAttribute( 'title' );
			}

			const searchAndPressEnter = async () => {
				await page.getByRole( 'searchbox' ).fill( keyword );
				await page.getByRole( 'searchbox' ).press( 'Enter' );
			};

			const [ response ] = await Promise.all( [
				// The domain lookup service is external and regularly exceeds the
				// 10s default timeout under load; give it a longer budget instead
				// of burning reloadAndRetry attempts on a slow-but-healthy service.
				page.waitForResponse( /suggestions\?/, { timeout: 30 * 1000 } ),
				searchAndPressEnter(),
			] );

			if ( ! response ) {
				const errorText = await page.getByRole( 'status', { name: 'Notice' } ).innerText();
				throw new Error(
					`Encountered error while searching for domain.\nOriginal error: ${ errorText }`
				);
			}

			// Wait for the DOM to reflect the new search results. The API
			// response resolves before React re-renders the suggestion list
			// (TanStack Query keeps isLoading false on refetch while prior
			// data is cached), so without this guard selectFirstSuggestion
			// can read a stale title from the previous search.
			if ( previousTitle ) {
				for ( let attempt = 0; attempt < 50; attempt++ ) {
					const current = await firstListitem.getAttribute( 'title' );
					if ( current !== previousTitle ) {
						break;
					}
					await page.waitForTimeout( 200 );
				}
			}
		}

		// Domain lookup service is external to Automattic and sometimes it returns an error.
		// Retry a few times when this is encountered.
		await reloadAndRetry( this.page, searchDomainClosure );
	}

	/**
	 * Clicks on the button to bring over an external domain to WordPress.com
	 */
	async clickBringItOver(): Promise< void > {
		await this.page.getByRole( 'button', { name: 'Bring it over' } ).click();
	}

	/**
	 * Clicks on the button to use a domain I already own
	 */
	async clickUseADomainIAlreadyOwn(): Promise< void > {
		await this.page.getByRole( 'button', { name: 'Use a domain I own' } ).click();
	}

	/**
	 * Click on the "Just buy a domain" option in the "Choose how to use your domain" page
	 */
	async selectJustBuyADomain(): Promise< void > {
		const button = await this.getContainer().getByRole( 'button', {
			name: /Just buy a domain.*/,
		} );
		await button.waitFor();
		await button.click();
	}

	/**
	 * Click on the "New site" option in the "Choose how to use your domain" page
	 */
	async selectNewSite(): Promise< void > {
		const button = await this.getContainer().getByRole( 'button', {
			name: /New site.*/,
		} );
		await button.waitFor();
		await button.click();
	}

	/**
	 * Select a domain matching the keyword.
	 *
	 * The keyword can be anything that uniquely identifies the desired domain name
	 * in the search results listing.
	 *
	 * Examples:
	 * 	keyword = uniquewordpresscomsite.com
	 * 	keyword = .com
	 *
	 * If multiple matches are found, the first match is attmpted.
	 *
	 * @param {string} keyword Unique keyword to select domains.
	 * @returns {string} Domain that was selected.
	 */
	async selectDomain( keyword: string ): Promise< string > {
		const targetRow = this.getContainer().getByTitle( keyword );
		const suggestion = await this.selectSuggestion( targetRow );

		if ( ! suggestion ) {
			throw new Error( `No domain found for keyword: ${ keyword }` );
		}

		return suggestion;
	}

	/**
	 * Select the first domain suggestion.
	 *
	 * @param {boolean} waitForContinueButton Whether to wait for the continue button to be enabled.
	 * @returns {string} Domain that was selected.
	 */
	async selectFirstSuggestion( waitForContinueButton: boolean = true ): Promise< string > {
		const targetRow = this.getContainer().getByRole( 'listitem' ).first();
		const suggestion = await this.selectSuggestion( targetRow, waitForContinueButton );

		if ( ! suggestion ) {
			throw new Error( 'No domain found for first suggestion' );
		}

		return suggestion;
	}

	/**
	 * Select a domain suggestion.
	 *
	 * @param {Locator} row The row to select.
	 * @param {boolean} waitForContinueButton Whether to wait for the continue button to be enabled.
	 * @returns {string | null} Domain that was selected.
	 */
	private async selectSuggestion(
		row: Locator,
		waitForContinueButton: boolean = true
	): Promise< string | null > {
		await row.waitFor();

		// List freshness is guaranteed by search(), which waits for the
		// suggestions response and for the DOM to reflect it before returning,
		// so a single read of the row title is reliable here.
		const selectedDomain = await row.getAttribute( 'title' );

		if ( ! selectedDomain ) {
			return null;
		}

		const addToCartButton = row.getByRole( 'button', { name: 'Add to cart' } );
		await addToCartButton.waitFor();

		const cartResponseSummaries: Promise< CartResponseDiagnostic >[] = [];
		const trackCartResponse = ( response: Response ) => {
			if ( ! isShoppingCartResponse( response ) ) {
				return;
			}

			cartResponseSummaries.push( summarizeCartResponse( response ) );
		};

		this.page.on( 'response', trackCartResponse );

		// ponytail: throwaway availability-precheck tracking. Remove with flake-probe.ts.
		const availabilitySummaries: Promise< AvailabilityDiagnostic >[] = [];
		const trackAvailabilityResponse = ( response: Response ) => {
			if ( isAvailabilityRequest( response.url() ) ) {
				availabilitySummaries.push( summarizeAvailabilityResponse( response ) );
			}
		};
		const trackAvailabilityFailure = ( request: Request ) => {
			if ( isAvailabilityRequest( request.url() ) ) {
				availabilitySummaries.push( Promise.resolve( summarizeAvailabilityFailure( request ) ) );
			}
		};
		this.page.on( 'response', trackAvailabilityResponse );
		this.page.on( 'requestfailed', trackAvailabilityFailure );
		const clickStartedAt = Date.now();

		// The add-to-cart API call can sometimes fail, leaving the button in an
		// error state (domain-suggestion-cta--error) instead of detaching it.
		// Retry the click up to 3 times when this happens.
		const maxRetries = 3;
		try {
			for ( let attempt = 1; attempt <= maxRetries; attempt++ ) {
				await addToCartButton.click();

				try {
					await addToCartButton.waitFor( { state: 'detached', timeout: 30000 } );
					break;
				} catch ( error ) {
					// Check if the button is in an error state, which means the API
					// call failed and we can retry.
					const hasErrorClass = await addToCartButton.evaluate( ( el ) =>
						el.classList.contains( 'domain-suggestion-cta--error' )
					);

					if ( ! hasErrorClass || attempt === maxRetries ) {
						throw new Error(
							await this.getAddToCartFailureDiagnostics( {
								row,
								addToCartButton,
								selectedDomain,
								cartResponseSummaries,
								availabilitySummaries,
								elapsedMs: Date.now() - clickStartedAt,
								originalError: error,
							} )
						);
					}
				}
			}
		} finally {
			this.page.off( 'response', trackCartResponse );
			this.page.off( 'response', trackAvailabilityResponse );
			this.page.off( 'requestfailed', trackAvailabilityFailure );
		}

		if ( waitForContinueButton ) {
			const continueButton = row.getByRole( 'button', { name: 'Continue' } );
			await continueButton.waitFor( { timeout: 30000 } );
		}

		return selectedDomain;
	}

	/**
	 * Builds domain-selection diagnostics for stuck Add to cart states.
	 *
	 * @param {Object} params Diagnostic inputs.
	 * @param {Locator} params.row Selected domain suggestion row.
	 * @param {Locator} params.addToCartButton Add to cart button in the selected row.
	 * @param {string} params.selectedDomain Domain name being selected.
	 * @param {Promise<CartResponseDiagnostic>[]} params.cartResponseSummaries Observed shopping cart responses.
	 * @param {Promise<AvailabilityDiagnostic>[]} params.availabilitySummaries Observed availability pre-check requests.
	 * @param {number} params.elapsedMs Wall-clock ms from the add-to-cart click to failure.
	 * @param {unknown} params.originalError Original Playwright error.
	 * @returns {Promise<string>} Error message with selected domain, button state, and cart responses.
	 */
	private async getAddToCartFailureDiagnostics( {
		row,
		addToCartButton,
		selectedDomain,
		cartResponseSummaries,
		availabilitySummaries,
		elapsedMs,
		originalError,
	}: {
		row: Locator;
		addToCartButton: Locator;
		selectedDomain: string;
		cartResponseSummaries: Promise< CartResponseDiagnostic >[];
		availabilitySummaries?: Promise< AvailabilityDiagnostic >[];
		elapsedMs?: number;
		originalError: unknown;
	} ): Promise< string > {
		const cartResponses = ( await Promise.allSettled( cartResponseSummaries ) ).map( ( result ) =>
			result.status === 'fulfilled' ? result.value : { error: formatError( result.reason ) }
		);

		// ponytail: throwaway. Resolve the availability captures and read the CTA
		// error text (rendered as a Tooltip, so hover to surface it). Emit a
		// greppable [FLAKE-PROBE] line. Remove with flake-probe.ts.
		const availabilityResponses = ( await Promise.allSettled( availabilitySummaries ?? [] ) ).map(
			( result ) =>
				result.status === 'fulfilled' ? result.value : { error: formatError( result.reason ) }
		);

		const ctaErrorText = await ( async () => {
			try {
				await addToCartButton.hover( { timeout: 2000 } );
				return normalizeText(
					await this.page.locator( '[role="tooltip"]' ).first().innerText( { timeout: 2000 } )
				);
			} catch ( error ) {
				return `<<unavailable: ${ formatError( error ) }>>`;
			}
		} )();

		flakeProbe( 'domain-add-to-cart', {
			selectedDomain,
			elapsedMs,
			ctaErrorText,
			availabilityResponses,
			cartResponseCount: cartResponses.length,
			originalError: formatError( originalError ),
		} );

		const allAddToCartButtons = await this.getContainer()
			.getByRole( 'button', { name: 'Add to cart' } )
			.evaluateAll( ( buttons ) =>
				buttons.slice( 0, 10 ).map( ( button ) => ( {
					className: button.getAttribute( 'class' ),
					disabled: ( button as HTMLButtonElement ).disabled,
					ariaDisabled: button.getAttribute( 'aria-disabled' ),
					ariaBusy: button.getAttribute( 'aria-busy' ),
				} ) )
			)
			.catch( ( error ) => ( { error: formatError( error ) } ) );

		const diagnostics = {
			selectedDomain,
			currentUrl: this.page.url(),
			button: {
				className: await addToCartButton.getAttribute( 'class' ).catch( formatError ),
				disabled: await addToCartButton
					.evaluate( ( button ) => ( button as HTMLButtonElement ).disabled )
					.catch( () => undefined ),
				ariaDisabled: await addToCartButton.getAttribute( 'aria-disabled' ).catch( formatError ),
				ariaBusy: await addToCartButton.getAttribute( 'aria-busy' ).catch( formatError ),
				text: normalizeText( await addToCartButton.textContent().catch( () => '' ) ),
			},
			row: {
				title: await row.getAttribute( 'title' ).catch( formatError ),
				text: normalizeText( await row.textContent().catch( () => '' ) ).slice( 0, 500 ),
				continueButtonCount: await row
					.getByRole( 'button', { name: 'Continue' } )
					.count()
					.catch( () => undefined ),
			},
			allAddToCartButtons,
			cartResponses: cartResponses.slice( -5 ),
			availabilityResponses: availabilityResponses.slice( -5 ),
			ctaErrorText,
			elapsedMs,
		};

		return [
			`Failed to select domain suggestion "${ selectedDomain }".`,
			`Original error: ${ formatError( originalError ) }`,
			`Diagnostics: ${ JSON.stringify( diagnostics, null, 2 ) }`,
		].join( '\n' );
	}

	/**
	 * Clicks the "Continue" button.
	 */
	async continue(): Promise< void > {
		const continueButton = await waitForElementEnabled( this.page, 'button:text("Continue")', {
			timeout: 30 * 1000,
		} );

		// Now click the enabled button using dispatchEvent to handle issues with the environment badge staying on top of the button.
		await Promise.all( [ continueButton.dispatchEvent( 'click' ), this.page.waitForNavigation() ] );
	}

	/**
	 * Skips the domain email upsell screen.
	 */
	async skipDomainEmailUpsell(): Promise< void > {
		await this.getContainer().getByRole( 'button', { name: 'Skip' } ).click();
	}

	/**
	 * Skips the domain search screen.
	 */
	async skipPurchase(): Promise< string > {
		const button = this.page.getByRole( 'button', { name: 'Skip purchase' } );

		await button.waitFor();

		let domain = await button.getAttribute( 'aria-label' );
		domain = domain?.replace( 'Skip purchase and continue with ', '' ) ?? null;

		if ( ! domain ) {
			throw new Error( 'No domain found for skip purchase button' );
		}

		await button.click();

		return domain;
	}
}
