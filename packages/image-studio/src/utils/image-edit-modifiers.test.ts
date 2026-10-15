import { getCropTransform, getImageEditModifiers } from './image-edit-modifiers';

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

	it( 'crops using percentages', () => {
		expect(
			getImageEditModifiers( { type: 'crop', left: 10, top: 20, width: 50, height: 40 } )
		).toEqual( [ { type: 'crop', args: { left: 10, top: 20, width: 50, height: 40 } } ] );
	} );
} );

describe( 'getCropTransform', () => {
	it( 'maps the cropped area to a crop transform', () => {
		expect( getCropTransform( { x: 10, y: 20, width: 50, height: 40 } ) ).toEqual( {
			type: 'crop',
			left: 10,
			top: 20,
			width: 50,
			height: 40,
		} );
	} );

	it( 'clamps values to the image bounds', () => {
		expect( getCropTransform( { x: -0.2, y: 60, width: 50.4, height: 40.3 } ) ).toEqual( {
			type: 'crop',
			left: 0,
			top: 60,
			width: 50.4,
			height: 40,
		} );
	} );

	it( 'returns null when the area keeps the whole image', () => {
		expect( getCropTransform( { x: 0, y: 0, width: 100, height: 100 } ) ).toBeNull();
		expect( getCropTransform( { x: -0.1, y: 0, width: 100.2, height: 100 } ) ).toBeNull();
	} );

	it( 'returns null for an empty area', () => {
		expect( getCropTransform( { x: 10, y: 10, width: 0, height: 40 } ) ).toBeNull();
	} );
} );
