import { SET_LAYOUT, SET_LAYOUT_STYLE, SET_VIEWS } from '../../action-types';
import { layoutStyle, views } from '../reducer';

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

describe( 'views', () => {
	it( 'stores nothing by default', () => {
		expect( views( undefined, { type: 'ANY_OTHER_ACTION' } ) ).toEqual( [] );
	} );

	it( 'stores the list set by SET_VIEWS', () => {
		const list = [ { name: 'likes', hidden: true }, { name: 'store' } ];
		expect( views( [], { type: SET_VIEWS, views: list } ) ).toEqual( list );
	} );

	it( 'ignores unrelated actions', () => {
		const list = [ { name: 'likes', hidden: true } ];
		expect( views( list, { type: SET_LAYOUT_STYLE, layoutStyle: 'classic' } ) ).toEqual( list );
	} );
} );
