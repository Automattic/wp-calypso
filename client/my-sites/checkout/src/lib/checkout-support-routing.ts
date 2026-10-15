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

/**
 * Assign the user to the checkout support experiment and return their variation.
 * Returns undefined when they aren't in it, or when the assignment fails or is too slow.
 * They then get the usual Help Center instead of being labelled `control`, because
 * ExPlat may still assign them to another variation in the background.
 * @returns The user's variation, or undefined.
 */
export async function loadCheckoutSupportVariation(): Promise<
	CheckoutSupportVariation | undefined
> {
	let timeoutId: ReturnType< typeof setTimeout > | undefined;
	const timeout = new Promise< null >( ( resolve ) => {
		timeoutId = setTimeout( () => resolve( null ), CHECKOUT_SUPPORT_ASSIGNMENT_TIMEOUT_MS );
	} );

	try {
		const assignment = await Promise.race( [
			loadExperimentAssignment( CHECKOUT_SUPPORT_EXPERIMENT ),
			timeout,
		] );
		const variationName = assignment?.variationName;
		return isCheckoutSupportVariation( variationName ) ? variationName : undefined;
	} catch {
		return undefined;
	} finally {
		clearTimeout( timeoutId );
	}
}
