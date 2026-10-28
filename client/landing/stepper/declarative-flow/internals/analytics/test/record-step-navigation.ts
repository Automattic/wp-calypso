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
	expect( recordTracksEvent ).toHaveBeenCalled();
	return jest.mocked( recordTracksEvent ).mock.lastCall?.[ 1 ];
};

describe( 'recordStepNavigation', () => {
	beforeEach( () => {
		jest.mocked( recordTracksEvent ).mockClear();
		jest.spyOn( console, 'warn' ).mockImplementation( () => {} );
	} );

	afterEach( () => {
		jest.restoreAllMocks();
	} );

	it( 'records a site object as its ID', () => {
		const props = record( { action: 'select-site', site: { ID: 123, slug: 'example.com' } } );

		expect( console.warn ).not.toHaveBeenCalled();
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

		expect( props ).toEqual( {
			device: 'desktop',
			flow: 'site-migration',
			step: 'sitePicker',
			intent: '',
			goals: '',
			action: 'update-query',
			host: 'other',
			is_free: false,
			missing: null,
		} );
	} );

	it( 'drops object values passed as additional props', () => {
		recordStepNavigation( {
			event: STEPPER_TRACKS_EVENT_STEP_NAV_SUBMIT,
			intent: '',
			flow: 'site-migration',
			step: 'sitePicker',
			additionalProps: { filters: { a: 1 }, selectedFilters: 'blog' },
		} );

		const props = jest.mocked( recordTracksEvent ).mock.lastCall?.[ 1 ];
		expect( props ).not.toHaveProperty( 'filters' );
		expect( props ).toMatchObject( { selected_filters: 'blog' } );
	} );

	it( 'warns in development about the object props it drops', () => {
		record( { queryParams: { search: 'foo' }, host: 'other' } );

		expect( console.warn ).toHaveBeenCalledTimes( 1 );
		expect( console.warn ).toHaveBeenCalledWith(
			expect.stringContaining( 'Tracks does not support nested properties' ),
			'query_params'
		);
	} );

	it.each( [
		[ { plan: { product_slug: 'business-bundle' } }, { plan: 'business-bundle' } ],
		[ { currentPlan: { product_slug: 'personal-bundle' } }, { current_plan: 'personal-bundle' } ],
		[ { selectedDesign: { slug: 'twentytwentyfour' } }, { selected_design: 'twentytwentyfour' } ],
		[
			{ domainItem: { product_slug: 'dotcom_domain', meta: 'example.com' } },
			{ domain_item: 'product_slug:dotcom_domain,meta:example.com' },
		],
		[ { cartItems: 'business-bundle' }, { cart_items: 'business-bundle' } ],
		[
			{ cartItems: [ { product_slug: 'business-bundle' }, { product_slug: 'jetpack_backup' } ] },
			{ cart_items: 'business-bundle,jetpack_backup' },
		],
	] )( 'flattens the known dependency %j instead of dropping it', ( deps, expected ) => {
		expect( record( deps ) ).toMatchObject( expected );
	} );

	it( 'records no plan slug when a free plan is selected', () => {
		expect( record( { plan: null } ) ).toMatchObject( { plan: undefined } );
	} );

	it( 'never records credentials or domain cart internals', () => {
		const props = record( {
			password: 'hunter2',
			password_confirm: 'hunter2',
			bearer_token: 'abc',
			token: 'abc',
			domainCart: 'cart',
			domainForm: 'form',
			suggestion: 'example.com',
		} );

		expect( Object.values( props ) ).not.toContain( 'hunter2' );
		expect( Object.values( props ) ).not.toContain( 'abc' );
		expect( Object.values( props ) ).not.toContain( 'example.com' );
		[
			'password',
			'password_confirm',
			'bearer_token',
			'token',
			'domain_cart',
			'domain_form',
			'suggestion',
		].forEach( ( key ) => expect( props ).not.toHaveProperty( key ) );
	} );

	it( 'records only whether an email was entered, never the address', () => {
		const props = record( { email: 'a@example.com' } );

		expect( props ).toMatchObject( { user_entered_email: true } );
		expect( props ).not.toHaveProperty( 'email' );
		expect( Object.values( props ) ).not.toContain( 'a@example.com' );
	} );
} );
