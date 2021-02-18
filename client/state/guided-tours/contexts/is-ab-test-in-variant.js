/**
 * Internal dependencies
 */
import { abtest } from 'calypso/lib/abtest';

/**
 * Returns a selector that tests whether an A/B test is in a given variant.
 *
 * @see client/lib/abtest
 *
 * @param {string} testName Name of A/B test
 * @param {string} variant Variant identifier
 * @returns {Function} Selector function
 */
export const isAbTestInVariant = ( testName, variant ) => () => abtest( testName ) === variant;
