import { HelpCenter } from '@automattic/data-stores';
import { loadExperimentAssignment } from 'calypso/lib/explat';
import type { CheckoutSupportVariation } from '@automattic/data-stores';

// Routes people who open support from checkout to Odie as it is (`control`), straight to a
// human (`human_only`), or to Odie that hands off to a human sooner (`hybrid`).
export const CHECKOUT_SUPPORT_EXPERIMENT = 'calypso_checkout_support_routing';

// Don't keep someone waiting on "Need help?": past this, they get the usual Help Center.
export const CHECKOUT_SUPPORT_ASSIGNMENT_TIMEOUT_MS = 2000;

const isCheckoutSupportVariation = (
	variationName: string | null | undefined
): variationName is CheckoutSupportVariation =>
	( HelpCenter.CHECKOUT_SUPPORT_VARIATIONS as readonly string[] ).includes( variationName ?? '' );

export type CheckoutSupportAssignment = {
	/** Undefined when the user isn't in the experiment, or the assignment failed or was too slow. */
	variation?: CheckoutSupportVariation;
	/**
	 * The assignment took longer than the timeout, so the user got no variation. ExPlat may still
	 * assign them one in the background, so the readout leaves these users out of every group.
	 */
	timedOut: boolean;
	/** How long the user waited for the assignment, in milliseconds. */
	durationMs: number;
};

const TIMED_OUT = Symbol( 'timed out' );

/**
 * Assign the user to the checkout support experiment and return their variation.
 * The variation is undefined when they aren't in it, or when the assignment fails or is too slow.
 * They then get the usual Help Center instead of being labelled `control`, because
 * ExPlat may still assign them to another variation in the background.
 * @returns The user's variation, whether the assignment timed out, and how long it took.
 */
export async function loadCheckoutSupportAssignment(): Promise< CheckoutSupportAssignment > {
	const startedAt = performance.now();
	const result = ( variation?: CheckoutSupportVariation, timedOut = false ) => ( {
		variation,
		timedOut,
		durationMs: Math.round( performance.now() - startedAt ),
	} );

	let timeoutId: ReturnType< typeof setTimeout > | undefined;
	const timeout = new Promise< typeof TIMED_OUT >( ( resolve ) => {
		timeoutId = setTimeout( () => resolve( TIMED_OUT ), CHECKOUT_SUPPORT_ASSIGNMENT_TIMEOUT_MS );
	} );

	try {
		const assignment = await Promise.race( [
			loadExperimentAssignment( CHECKOUT_SUPPORT_EXPERIMENT ),
			timeout,
		] );
		if ( assignment === TIMED_OUT ) {
			return result( undefined, true );
		}
		const variationName = assignment?.variationName;
		return result( isCheckoutSupportVariation( variationName ) ? variationName : undefined );
	} catch {
		return result();
	} finally {
		clearTimeout( timeoutId );
	}
}
