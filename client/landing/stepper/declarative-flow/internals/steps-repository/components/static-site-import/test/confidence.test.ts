import { getStaticSiteImportConfidence } from '../confidence';

const inspected = ( capabilities = {} ) => ( {
	measured: true,
	confidence: 'bounded-sample' as const,
	routes: 12,
	capabilities,
} );

describe( 'getStaticSiteImportConfidence', () => {
	it( 'moves everything from a clean, fully inspected site', () => {
		expect(
			getStaticSiteImportConfidence( { pages: 12, quality_pass: true, inspection: inspected() } )
		).toEqual( { outcome: 'everything', blockers: [], setup: [], isComplete: true } );
	} );

	it( 'is less sure when only a sample of the site was inspected', () => {
		expect(
			getStaticSiteImportConfidence( {
				pages: 12,
				quality_pass: true,
				inspection: { ...inspected(), confidence: 'incomplete' },
			} )
		).toMatchObject( { outcome: 'everything', isComplete: false } );
	} );

	it( 'lists what needs a hand after the move', () => {
		expect(
			getStaticSiteImportConfidence( {
				pages: 10,
				quality_pass: false,
				inspection: inspected( { forms: 1, embeds: 2 } ),
				fidelity: { measured: true, pass: false },
			} )
		).toMatchObject( {
			outcome: 'almost-everything',
			setup: [ 'form', 'embeds', 'sections', 'layout', 'pages' ],
		} );
	} );

	it( 'needs manual work for stores, bookings, and member logins', () => {
		expect(
			getStaticSiteImportConfidence( {
				pages: 12,
				quality_pass: true,
				inspection: inspected( { commerce: 1, booking: 1, membership: 1, forms: 1 } ),
			} )
		).toMatchObject( {
			outcome: 'manual-work',
			blockers: [ 'store', 'bookings', 'membership' ],
			setup: [ 'form' ],
		} );
	} );

	it( 'ignores capabilities when the site could not be inspected', () => {
		expect(
			getStaticSiteImportConfidence( {
				pages: 3,
				quality_pass: true,
				inspection: { measured: false, capabilities: { commerce: 1 } },
			} )
		).toMatchObject( { outcome: 'everything', isComplete: false } );
	} );
} );
