import { STEPPER_TRACKS_EVENT_STEP_NAV_SUBMIT } from 'calypso/landing/stepper/constants';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { recordStepNavigation } from '../record-step-navigation';

jest.mock( 'calypso/lib/analytics/tracks' );
jest.mock( '@automattic/viewport', () => ( {
	resolveDeviceTypeByViewPort: () => 'desktop',
} ) );

const record = ( providedDependencies: Record< string, unknown > ) => {
	recordStepNavigation( {
		event: STEPPER_TRACKS_EVENT_STEP_NAV_SUBMIT,
		intent: '',
		flow: 'site-migration',
		step: 'sitePicker',
		providedDependencies,
	} );
	return jest.mocked( recordTracksEvent ).mock.calls[ 0 ][ 1 ];
};

describe( 'recordStepNavigation', () => {
	beforeEach( () => {
		jest.mocked( recordTracksEvent ).mockClear();
	} );

	it( 'records a site object as its ID', () => {
		const props = record( { action: 'select-site', site: { ID: 123, slug: 'example.com' } } );

		expect( props ).toMatchObject( { action: 'select-site', site_id: 123 } );
		expect( props ).not.toHaveProperty( 'site' );
	} );

	it( 'keeps a site passed as a string', () => {
		expect( record( { site: 'example.com' } ) ).toMatchObject( { site: 'example.com' } );
	} );

	it( 'joins arrays of primitive values', () => {
		expect( record( { features: [ 'a', 'b' ] } ) ).toMatchObject( { features: 'a,b' } );
	} );

	it( 'drops object values it does not know how to flatten', () => {
		const props = record( {
			action: 'update-query',
			queryParams: { search: 'foo' },
			products: [ { slug: 'bar' } ],
			host: 'other',
			isFree: false,
			missing: null,
		} );

		expect( props ).not.toHaveProperty( 'query_params' );
		expect( props ).not.toHaveProperty( 'products' );
		expect( props ).toMatchObject( {
			action: 'update-query',
			host: 'other',
			is_free: false,
			missing: null,
		} );
	} );

	it( 'still flattens the known plan dependency', () => {
		expect( record( { plan: { product_slug: 'business-bundle' } } ) ).toMatchObject( {
			plan: 'business-bundle',
		} );
	} );
} );
