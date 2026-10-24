import { getImageEditModifiers } from './image-edit-modifiers';

describe( 'getImageEditModifiers', () => {
	it( 'rotates right by 90 degrees clockwise', () => {
		expect( getImageEditModifiers( { type: 'rotate', direction: 'right' } ) ).toEqual( [
			{ type: 'rotate', args: { angle: 90 } },
		] );
	} );

	it( 'rotates left by 270 degrees clockwise', () => {
		expect( getImageEditModifiers( { type: 'rotate', direction: 'left' } ) ).toEqual( [
			{ type: 'rotate', args: { angle: 270 } },
		] );
	} );

	it( 'flips horizontally', () => {
		expect( getImageEditModifiers( { type: 'flip', axis: 'horizontal' } ) ).toEqual( [
			{ type: 'flip', args: { flip: { horizontal: true, vertical: false } } },
		] );
	} );

	it( 'flips vertically', () => {
		expect( getImageEditModifiers( { type: 'flip', axis: 'vertical' } ) ).toEqual( [
			{ type: 'flip', args: { flip: { horizontal: false, vertical: true } } },
		] );
	} );
} );
