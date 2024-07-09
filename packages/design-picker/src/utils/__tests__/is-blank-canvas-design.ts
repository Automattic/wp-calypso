import { isBlankCanvasDesign } from '../available-designs';

jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: () => false,
} ) );

describe( 'Design Picker blank canvas utils', () => {
	describe( 'isBlankCanvasDesign', () => {
		it( 'should match any design that contains "blank-canvas" in its slug', () => {
			const mockDesign = {
				title: 'Mock',
				slug: 'mock-blank-canvas-design-slug',
				template: 'mock-blank-canvas-design-template',
				theme: 'mock-blank-canvas-design-theme',
				categories: [ { slug: 'featured', name: 'Featured' } ],
				features: [],
			};
			expect( isBlankCanvasDesign( mockDesign ) ).toBeTruthy();

			mockDesign.slug = 'Blank-CanvAS';
			expect( isBlankCanvasDesign( mockDesign ) ).toBeTruthy();

			mockDesign.slug = 'blank-canva';
			expect( isBlankCanvasDesign( mockDesign ) ).toBeFalsy();
		} );
		it( 'should return false when no design is provided', () => {
			expect( isBlankCanvasDesign() ).toBeFalsy();
		} );
		it( 'should return false when undefined is provided', () => {
			expect( isBlankCanvasDesign( undefined ) ).toBeFalsy();
		} );
	} );
} );
