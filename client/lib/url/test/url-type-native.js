/**
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import { determineUrlType } from '../url-type';

describe( 'determineUrlType', () => {
	const runTests = require( './common/url-type.skip' );
	runTests( determineUrlType );
} );
