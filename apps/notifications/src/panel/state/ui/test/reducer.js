import { SET_LAYOUT, SET_LAYOUT_STYLE } from '../../action-types';
import { layoutStyle } from '../reducer';

describe( 'layoutStyle', () => {
	it( 'defaults to classic', () => {
		expect( layoutStyle( undefined, { type: 'ANY_OTHER_ACTION' } ) ).toBe( 'classic' );
	} );

	it( 'stores the style set by SET_LAYOUT_STYLE', () => {
		expect( layoutStyle( 'classic', { type: SET_LAYOUT_STYLE, layoutStyle: 'simplified' } ) ).toBe(
			'simplified'
		);
	} );

	it( 'is untouched by the unrelated SET_LAYOUT action', () => {
		expect( layoutStyle( 'simplified', { type: SET_LAYOUT, layout: 'widescreen' } ) ).toBe(
			'simplified'
		);
	} );
} );
