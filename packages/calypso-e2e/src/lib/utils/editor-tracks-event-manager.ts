import { Locator, Page } from 'playwright';
import { TracksEvent, TracksEventProperties } from '../../types';

export interface TracksEventSearchOptions {
	/**
	 *
	 */
	waitForEventMs?: number;
}

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

/**
 * A class wrapping the editor Tracks events monitored in the browser
 */
export class EditorTracksEventManager {
	private page: Page;
	private editor: Locator;

	/**
	 * Construct an instance of the editor Tracks event manager
	 *
	 * @param page The Playwright page
	 */
	constructor( page: Page ) {
		this.page = page;

		// The Tracks events are stashed on "window" in whatever iframe is the actual editor (whether post, page, or site).
		// We need to consolidate down to a single locator that works across all editors, and handles if we have the Gutenframe wrapper.
		// It just matters that we're in the right iframe, so we use a very generic selector ("body") to get something safe and top-level.
		if ( this.page.url().includes( '/wp-admin' ) ) {
			this.editor = this.page.locator( 'body' );
		} else {
			// We're in some kind of Gutenframe!
			this.editor = this.page.frameLocator( '[src*="wp-admin/post"]' ).locator( 'body' );
		}
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
	 * @param {Object} options Keyed valued parameter of options to modify searching.
	 * @param {TracksEventProperties} options.matchingProperties Any properties that must be present and matching for the event to match.
	 * @param {number} options.waitForEventMs The number of milliseconds to wait to see if the Tracks event fires. Useful if the events are debounced.
	 * @returns True/false based on whether a matching event was found.
	 */
	async didEventFire(
		name: string,
		options?: { matchingProperties?: TracksEventProperties; waitForEventMs?: number }
	): Promise< boolean > {
		const isEventOnStack = async ( name: string, matchingProperties?: TracksEventProperties ) => {
			const eventStack = await this.getAllEvents();
			return eventStack.some( createEventMatchingPredicate( name, matchingProperties ) );
		};

		const WAIT_INTERVAL_MS = 200;
		const maxMstoWait = options?.waitForEventMs || 0;
		let totalWaitedMs = 0;

		// By doing an initial check and starting the loop with the wait,
		// we avoid doing an extra, unnecessary wait at the end.
		let eventIsOnStack = await isEventOnStack( name, options?.matchingProperties );
		while ( ! eventIsOnStack && totalWaitedMs < maxMstoWait ) {
			await sleep( WAIT_INTERVAL_MS );
			totalWaitedMs += WAIT_INTERVAL_MS;
			eventIsOnStack = await isEventOnStack( name, options?.matchingProperties );
		}

		return eventIsOnStack;
	}
}
