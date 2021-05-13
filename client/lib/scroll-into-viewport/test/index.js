/**
 * Internal dependencies
 */
import { recursivelyWalkAndSum } from '../index';

describe( 'recursivelyWalkAndSum', () => {
	test( 'should sum all requested values', () => {
		const structure = {
			offsetTop: 10,
			offsetParent: {
				offsetTop: 140,
			},
		};
		expect( recursivelyWalkAndSum( structure, 'offsetTop', 'offsetParent' ) ).toBe( 150 );
	} );

	test( 'should sum all requested values when offsetTop is 0 at some point', () => {
		const structure = {
			offsetTop: 10,
			offsetParent: {
				offsetTop: 0,
				offsetParent: {
					offsetTop: 140,
				},
			},
		};
		expect( recursivelyWalkAndSum( structure, 'offsetTop', 'offsetParent' ) ).toBe( 150 );
	} );
} );
