/**
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import { determineUrlType } from '../url-type';
import runTests from './common/url-type.skip';

describe( 'determineUrlType', () => {
	runTests( determineUrlType );
} );
