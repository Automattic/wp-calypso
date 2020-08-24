/**
 * This file is meant to be used to create functions to get the state of an AB test.
 * We want to avoid writing error-prone code like:
 *
 * ```
 * if ( 'some-variant' === abtest( 'some-experiment' ) ) {
 *    // do something
 * }
 * ```
 */

/**
 * Internal dependencies
 */
import { abtest } from 'lib/abtest';

/**
 * Returns whether the Offer Reset AB experiment is active.
 *
 * @returns {boolean}  Whether the 'showOfferResetFlow' variant is active.
 */
export const shouldShowOfferResetFlow = () => {
	return 'showOfferResetFlow' === abtest( 'offerResetFlow' );
};
