/**
 * External dependencies
 */
import { getCLS, getFCP, getFID, getLCP, getTTFB } from 'web-vitals';

/**
 * See https://web.dev/cls/
 */
export const getCumulativeLayoutShift = async (): Promise< number > =>
	new Promise( ( resolve ) => getCLS( ( metric ) => resolve( metric.value ) ) );

/**
 * See https://web.dev/fcp/
 */
export const getFirstContentfulPaint = async (): Promise< number > =>
	new Promise( ( resolve ) => getFCP( ( metric ) => resolve( metric.value ) ) );

/**
 * See https://web.dev/fid/
 */
export const getFirstInputDelay = async (): Promise< number > =>
	new Promise( ( resolve ) => getFID( ( metric ) => resolve( metric.value ) ) );

/**
 * See https://web.dev/lcp/
 */
export const getLargestContentfulPaint = async (): Promise< number > =>
	new Promise( ( resolve ) => getLCP( ( metric ) => resolve( metric.value ) ) );

/**
 * See https://web.dev/time-to-first-byte/
 */
export const getTimeToFirstByte = async (): Promise< number > =>
	new Promise( ( resolve ) => getTTFB( ( metric ) => resolve( metric.value ) ) );
