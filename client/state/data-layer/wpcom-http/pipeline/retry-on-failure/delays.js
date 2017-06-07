/**
 * PRNG-based functions providing enhanced versions of simple delay
 * formulas in order to spread out an array of failing operations
 * over more uniform time distributions.
 *
 * Jitter is introduced so that if, for example, twenty requests all
 * fail at the same time, that they won't all retry at the same time.
 * This should mitigate load on the server after failed requests and
 * lead towards more retry attempts succeeding faster than with the
 * naïve delay formulas.
 *
 * @module state/data-layer/wpcom-http/pipeline/retry-on-failure/delays
 */

/**
 * External dependencies
 */
import { random } from 'lodash';

/**
 * Computes basic delay with random jitter
 *
 * Returns a delay as short as the given delay
 * and as long as twice the given delay.
 *
 * @param {Number} delay number of ms for delay
 * @returns {Number} delay until next attempt
 */
export const basicJitter = delay => delay + random( delay );

/**
 * Computes "decorrelated jitter" delay
 *
 * @see https://www.awsarchitectureblog.com/2015/03/backoff.html
 *
 * @param {Number} baseDelay number of ms for initial delay
 * @param {Number} retryCount attempt number for retry
 * @returns {Number} ms delay until next attempt
 */
export const decorrelatedJitter = ( baseDelay, retryCount ) => {
	const delay = Math.round( ( baseDelay * Math.pow( 2, retryCount ) ) / 2 );
	const jitter = delay + random( 0, delay );

	return random( baseDelay, jitter * 3 );
};
