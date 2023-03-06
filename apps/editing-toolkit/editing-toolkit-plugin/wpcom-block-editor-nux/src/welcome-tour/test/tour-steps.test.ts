import '../get-editor-type';
import getTourSteps from '../tour-steps';

jest.mock( '../get-editor-type', () => {
	return { getEditorType: () => 'post' };
} );

describe( 'Welcome Tour', () => {
	describe( 'Tour Steps', () => {
		it( 'should retrieve the "Welcome to WordPress!" slide', () => {
			expect( getTourSteps( 'en', true ) ).toEqual(
				expect.arrayContaining( [
					expect.objectContaining( {
						meta: expect.objectContaining( { heading: 'Welcome to WordPress!' } ),
					} ),
				] )
			);
		} );
		it( 'should retrieve the "Everything is a block" slide', () => {
			expect( getTourSteps( 'en', true ) ).toEqual(
				expect.arrayContaining( [
					expect.objectContaining( {
						meta: expect.objectContaining( { heading: 'Everything is a block' } ),
					} ),
				] )
			);
		} );
		it( 'should retrieve the "Adding a new block" slide', () => {
			expect( getTourSteps( 'en', true ) ).toEqual(
				expect.arrayContaining( [
					expect.objectContaining( {
						meta: expect.objectContaining( { heading: 'Adding a new block' } ),
					} ),
				] )
			);
		} );
		it( 'should retrieve the "Click a block to change it" slide', () => {
			expect( getTourSteps( 'en', true ) ).toEqual(
				expect.arrayContaining( [
					expect.objectContaining( {
						meta: expect.objectContaining( { heading: 'Click a block to change it' } ),
					} ),
				] )
			);
		} );
		it( 'should retrieve the "More Options" slide', () => {
			expect( getTourSteps( 'en', true ) ).toEqual(
				expect.arrayContaining( [
					expect.objectContaining( {
						meta: expect.objectContaining( { heading: 'More Options' } ),
					} ),
				] )
			);
		} );
		it( 'should retrieve the "Find your way" slide', () => {
			expect( getTourSteps( 'en', true ) ).toEqual(
				expect.arrayContaining( [
					expect.objectContaining( {
						meta: expect.objectContaining( { heading: 'Find your way' } ),
					} ),
				] )
			);
		} );
		it( 'should retrieve the "Undo any mistake" slide', () => {
			expect( getTourSteps( 'en', true ) ).toEqual(
				expect.arrayContaining( [
					expect.objectContaining( {
						meta: expect.objectContaining( { heading: 'Undo any mistake' } ),
					} ),
				] )
			);
		} );
		it( 'should retrieve the "Drag & drop" slide', () => {
			expect( getTourSteps( 'en', true ) ).toEqual(
				expect.arrayContaining( [
					expect.objectContaining( {
						meta: expect.objectContaining( { heading: 'Undo any mistake' } ),
					} ),
				] )
			);
		} );
		it( 'should retrieve the "Edit your site" slide, when in site editor', () => {
			expect( getTourSteps( 'en', true, true ) ).toEqual(
				expect.arrayContaining( [
					expect.objectContaining( {
						meta: expect.objectContaining( { heading: 'Edit your site' } ),
					} ),
				] )
			);
		} );
		it( 'should not retrieve the "Edit your site" slide, when not in site editor', () => {
			expect( getTourSteps( 'en', true, false ) ).not.toEqual(
				expect.arrayContaining( [
					expect.objectContaining( {
						meta: expect.objectContaining( { heading: 'Edit your site' } ),
					} ),
				] )
			);
		} );
		it( 'should retrieve the "Congratulations!" slide, with correct url', () => {
			expect( getTourSteps( 'en', true ) ).toEqual(
				expect.arrayContaining( [
					expect.objectContaining( {
						meta: expect.objectContaining( { heading: 'Congratulations!' } ),
					} ),
				] )
			);
		} );
	} );
} );
