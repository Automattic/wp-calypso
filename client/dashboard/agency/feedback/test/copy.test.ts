/**
 * @jest-environment jsdom
 */
import { getFeedbackCopy } from '../copy';
import type { FeedbackType } from '../types';

const ALL_TYPES: FeedbackType[] = [
	'team-member-invite-sent',
	'partner-directory-details-added',
	'purchase-completed',
];

describe( 'getFeedbackCopy', () => {
	test( 'names the milestone and offers suggestions for every type', () => {
		for ( const type of ALL_TYPES ) {
			const copy = getFeedbackCopy( type );
			expect( copy.title ).not.toBe( '' );
			expect( copy.description ).not.toBe( '' );
			expect( copy.suggestion?.options.length ).toBeGreaterThan( 1 );
			expect( copy.suggestion?.options.at( -1 )?.value ).toBe( 'other' );
		}
	} );

	test( 'tells the partner which address the invite went to', () => {
		const copy = getFeedbackCopy( 'team-member-invite-sent', { email: 'nina@example.com' } );

		expect( copy.description ).toContain( 'nina@example.com' );
		expect( copy.description ).not.toContain( '%(email)s' );
	} );

	test( 'leaves the sentence readable when no address is known', () => {
		const copy = getFeedbackCopy( 'team-member-invite-sent' );

		expect( copy.description ).not.toContain( '%(email)s' );
	} );
} );
