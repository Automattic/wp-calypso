import { Locator, Page } from 'playwright';
import { TracksEvent, TracksEventProperties } from './types';

// Exporting just for unit testing
export const createEventMatchingPredicate = (
	expectedName: string,
	matchingProperties?: TracksEventProperties
) => {
	return ( event: TracksEvent ) => {
		const [ name, properties ] = event;
		if ( expectedName !== name ) {
			return false;
		}

		if ( ! matchingProperties ) {
			return true; // Nothing more to check, we're done here!
		}

		for ( const expectedProperty in matchingProperties ) {
			if ( properties[ expectedProperty ] !== matchingProperties[ expectedProperty ] ) {
				return false;
			}
		}

		return true;
	};
};

const sleep = async ( ms: number ) => new Promise( ( resolve ) => setTimeout( resolve, ms ) );

interface EventSearchOptions {
	/**
	 * Any properties that must be present and matching for the event to match.
	 */
	matchingProperties?: TracksEventProperties;

	/**
	 * The number of milliseconds to wait to see if the Tracks event fires. Useful if the events are debounced.
	 */
	waitForEventMs?: number;
}

/**
 * A class wrapping the editor Tracks events monitored in the browser
 */
export class EditorTracksEventManager {
	private page: Page;

	/**
	 * Construct an instance of the editor Tracks event manager
	 *
	 * @param page The Playwright page
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * A locator within the correct iframe for the editor, to correctly grab values off of window.
	 */
	private get editor(): Locator {
		// The Tracks events are stashed on "window" in whatever iframe is the actual editor (whether post, page, or site).
		// We need to consolidate down to a single locator that works across all editors, and handles if we have the Gutenframe wrapper.
		// It just matters that we're in the right iframe, so we use a very generic selector ("body") to get something safe and top-level.
		return this.page.url().includes( '/wp-admin' )
			? this.page.locator( 'body' ) // No Gutenframe
			: this.page
					.frameLocator(
						'[src*="wp-admin/post"],[src*="wp-admin/themes"],[src*="wp-admin/site-editor"]'
					) // Post, page, and site editor!
					.locator( 'body' ); // Gutenframe
	}

	/**
	 * Get the full stack (reverse chronological) of Tracks events that is tracked for E2E tests.
	 *
	 * @throws If we can't find the events. Empty but instantiated event stacks are still valid.
	 */
	async getAllEvents(): Promise< TracksEvent[] > {
		const eventStack = await this.editor.evaluate( () => window._e2eEventsStack );

		if ( ! eventStack ) {
			throw new Error(
				'Could not find the Tracks events. Expected "_e2eEventsStack" property on the editor window object.'
			);
		}

		return eventStack;
	}

	/**
	 * Clears the E2E Tracks events in the browser.
	 */
	async clearEvents(): Promise< void > {
		// We need to make sure that we're accurately finding the event stack first.
		// Otherwise, resetting it could cause weird artifacts later!
		await this.getAllEvents();
		await this.editor.evaluate( () => {
			window._e2eEventsStack = [];
		} );
	}

	/**
	 * Checks if a given Tracks event fired by matching on event name and optionally event properties
	 *
	 * @param {string} name The name of the event we are searching for.
	 * @param {EventSearchOptions} options Options to control searching for the event.
	 * @returns True/false based on whether a matching event was found.
	 */
	async didEventFire( name: string, options?: EventSearchOptions ): Promise< boolean > {
		const isEventOnStack = async () => {
			const eventStack = await this.getAllEvents();
			return eventStack.some( createEventMatchingPredicate( name, options?.matchingProperties ) );
		};
		const stopSearching = ( result: boolean ) => result;
		const maxMstoWait = options?.waitForEventMs || 0;

		const eventIsOnStack = await this.searchWithRetry( isEventOnStack, stopSearching, maxMstoWait );
		return eventIsOnStack;
	}

	/**
	 * Get the most Tracks event that matches the name and options provided.
	 *
	 * @param {string} name The name of the event we are searching for.
	 * @param {EventSearchOptions} options Options to control searching for the event.
	 * @returns The most recent matching Tracks event.
	 * @throws If no matching Tracks event was found.
	 */
	async getMostRecentMatchingEvent(
		name: string,
		options?: EventSearchOptions
	): Promise< TracksEvent > {
		const findMostRecentEventOnStack = async () => {
			const eventStack = await this.getAllEvents();
			return eventStack.find( createEventMatchingPredicate( name, options?.matchingProperties ) );
		};
		const stopSearching = ( result: TracksEvent | undefined ) => !! result;
		const maxMstoWait = options?.waitForEventMs || 0;

		const mostRecentEvent = await this.searchWithRetry(
			findMostRecentEventOnStack,
			stopSearching,
			maxMstoWait
		);

		if ( ! mostRecentEvent ) {
			throw new Error(
				`No Tracks event was found with provided name (${ name }) and matching properties.`
			);
		}

		return mostRecentEvent;
	}

	/**
	 * A shared private helper method for retrying an event search on a loop.
	 *
	 * Because Tracks events can be debounced, sometimes we'll need to wait and retry while searching.
	 *
	 * This supports generic typing because we could be looking for various things.
	 * That means our result return type could vary: boolean, a single event, an array of events, etc.
	 *
	 * Because our event searching function could return a variety of types,
	 * we need some way to translate those varied types to a boolean.
	 * It's safer to be explicit rather than force the type conversion.
	 * For example, an empty array is technically "truthy"!
	 *
	 * @param {Function} searchForEvent Function to do the event searching.
	 * @param {Function} stopSearching Function to determine when to stop searching, based on the result of the search.
	 * @param {number} maxMsToWait Max number of milliseconds to keep retrying.
	 * @returns The result of the searchForEvent function after necessary retries.
	 */
	private async searchWithRetry< SearchResult >(
		searchForEvent: () => Promise< SearchResult >,
		stopSearching: ( result: SearchResult ) => boolean,
		maxMsToWait: number
	): Promise< SearchResult > {
		const WAIT_INTERVAL_MS = 200;
		let totalWaitedMs = 0;

		// By doing an initial check and starting the loop with the wait,
		// we avoid doing an extra, unnecessary wait at the end.
		let result = await searchForEvent();
		while ( ! stopSearching( result ) && totalWaitedMs < maxMsToWait ) {
			await sleep( WAIT_INTERVAL_MS );
			totalWaitedMs += WAIT_INTERVAL_MS;
			result = await searchForEvent();
		}

		return result;
	}
}
