/**
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import { determineUrlType } from '../src';
import runTests from './common/url-type.skip';

describe( 'determineUrlType', () => {
	runTests( determineUrlType );
} );
