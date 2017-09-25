/**
 * External dependencies
 */
import { random } from 'lodash';

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
	const delay = Math.round( ( baseDelay * Math.pow( 2, retryCount - 1 ) ) / 2 );
	const jitter = delay + random( 0, delay );

	return random( baseDelay, jitter * 3 );
};
