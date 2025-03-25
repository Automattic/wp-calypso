import { getCurrentLayoutFocus } from '../../layout-focus/selectors';

describe( 'selectors', () => {
	let state;

	beforeAll( () => {
		state = {
			ui: {
				layoutFocus: {
					current: 'content',
					next: 'preview',
				},
			},
		};
	} );

	describe( 'getCurrentLayoutFocus', () => {
		test( 'returns the current layout focus area', () => {
			expect( getCurrentLayoutFocus( state ) ).toEqual( 'content' );
		} );
	} );
} );
