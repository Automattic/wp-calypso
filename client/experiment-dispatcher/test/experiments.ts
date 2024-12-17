import { experimentsCatalog } from '../experiments.ts';

const experiments = Object.entries( experimentsCatalog );

describe( 'Checking experiments validity', () => {
	for ( const experiment of experiments ) {
		const [ slug, experimentValue ] = experiment;
		it( `experiment_explat_id should be defined and unique: ${ slug }.`, () => {
			expect( experimentValue.experiment_explat_id ).toBeDefined();
			expect(
				experiments.filter(
					( [ , e ] ) => e.experiment_explat_id === experimentValue.experiment_explat_id
				).length
			).toBe( 1 );
		} );

		it( `experiment should have at least two variants: ${ slug }.`, () => {
			expect( Object.keys( experimentValue.variants ).length ).toBeGreaterThanOrEqual( 2 );
		} );

		it( `experiment should have a control variant: ${ slug }.`, () => {
			expect( experimentValue.variants.control ).toBeDefined();
		} );

		it( `Variants URLs should be either absolute or root relative: ${ slug }.`, () => {
			expect(
				Object.values( experimentValue.variants ).every(
					( variant ) => variant.url.startsWith( '/' ) || variant.url.startsWith( 'https' )
				)
			).toBe( true );
		} );
	}
} );
