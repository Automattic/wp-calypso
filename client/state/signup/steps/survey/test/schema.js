/** @format */

/**
 * Internal dependencies
 */
import { surveyStepSchema } from '../schema';

test( 'schema should be valid', () => {
	expect( surveyStepSchema ).toBeValidSchema();
} );
