/**
 * @vitest-environment jsdom
 */

import { getSolutionsForReason } from '../get-solutions-for-reason';

describe( 'getSolutionsForReason', () => {
	test( 'shows support, then WordPress Agent, then guides for "Could not easily reach a human support agent"', () => {
		expect( getSolutionsForReason( 'noHumanSupport' )?.map( ( { id } ) => id ) ).toEqual( [
			'speak-with-support',
			'ask-ai-assistant',
			'find-guides',
		] );
	} );
} );
