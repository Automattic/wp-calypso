/**
 * @vitest-environment jsdom
 */

import { getSolutionsForReason, getSolutionsReason } from '../get-solutions-for-reason';

describe( 'getSolutionsReason', () => {
	test.each( [ [ 'otherPriceValue', 'price/budget' ] ] )(
		'uses %s, not the typed text, when text is typed in its box',
		( id, parent ) => {
			expect( getSolutionsReason( 'test reason', id, parent ) ).toBe( id );
		}
	);

	test( 'uses "Another reason" when text is typed in its box', () => {
		expect( getSolutionsReason( 'test reason', undefined, 'anotherReasonOne' ) ).toBe(
			'anotherReasonOne'
		);
	} );

	test( 'keeps the typed text for something else related to changed needs', () => {
		expect( getSolutionsReason( 'test reason', 'otherNoLongerNeedSite', 'noLongerNeedSite' ) ).toBe(
			'test reason'
		);
	} );
} );

describe( 'getSolutionsForReason', () => {
	test( 'shows support, then WordPress Agent, then guides for "Could not easily reach a human support agent"', () => {
		expect( getSolutionsForReason( 'noHumanSupport' )?.map( ( { id } ) => id ) ).toEqual( [
			'speak-with-support',
			'ask-ai-assistant',
			'find-guides',
		] );
	} );
} );
