import { EMPTY_LIVE_BUILD_STATE, foldFeedDelta } from '../build-feed-state';
import type { BuildWowFeedDelta } from '../build-feed';

describe( 'foldFeedDelta', () => {
	it( 'folds the prepare-phase events into a renderable snapshot', () => {
		const delta: BuildWowFeedDelta = {
			run_id: 'run-a',
			latest_seq: 5,
			events: [
				{ seq: 1, type: 'identity', data: { title: 'Café Lisboa', description: 'Coffee in Alfama.' } },
				{
					seq: 2,
					type: 'design_direction',
					data: { title: 'Quiet Luxe', palette: [ '#101010', '#eaddcf' ], heading_font: 'Fraunces' },
				},
				{
					seq: 3,
					type: 'palette',
					data: { colors: [ { slug: 'base', color: '#ffffff' }, { slug: 'contrast', color: '#111111' } ] },
				},
				{
					seq: 4,
					type: 'fonts',
					data: { families: [ { slug: 'heading', name: 'Fraunces', fontFamily: '"Fraunces", serif' } ] },
				},
				{
					seq: 5,
					type: 'page_plan',
					data: {
						pages: [
							{ slug: 'home', title: 'Home', front: true, sections: [ { slug: 'hero', title: 'Hero' } ] },
						],
					},
				},
			],
		};

		const state = foldFeedDelta( EMPTY_LIVE_BUILD_STATE, delta );

		expect( state.identity?.title ).toBe( 'Café Lisboa' );
		expect( state.design?.title ).toBe( 'Quiet Luxe' );
		expect( state.colors ).toHaveLength( 2 );
		expect( state.fonts?.[ 0 ]?.fontFamily ).toBe( '"Fraunces", serif' );
		expect( state.pages?.[ 0 ]?.front ).toBe( true );
	} );

	it( 'upserts sections by part key, idempotently', () => {
		const section: BuildWowFeedDelta = {
			events: [
				{
					seq: 6,
					type: 'section',
					key: 'page-home--hero',
					data: { part: 'section', page: 'home', section: 'hero', heading: 'Small-batch & slow' },
				},
			],
		};

		const once = foldFeedDelta( EMPTY_LIVE_BUILD_STATE, section );
		const twice = foldFeedDelta( once, section );

		expect( Object.keys( twice.sections ) ).toEqual( [ 'page-home--hero' ] );
		expect( twice.sections[ 'page-home--hero' ].heading ).toBe( 'Small-batch & slow' );
	} );

	it( 'resolves design_asset refs against the delta assets map', () => {
		const state = foldFeedDelta( EMPTY_LIVE_BUILD_STATE, {
			events: [
				{ seq: 1, type: 'design_asset', data: { ref: 'design_home' } },
				{ seq: 2, type: 'design_asset', data: { ref: 'design_css' } },
				// A ref whose blob was evicted server-side folds to nothing.
				{ seq: 3, type: 'design_asset', data: { ref: 'design_preview' } },
			],
			assets: { design_home: '<html></html>', design_css: 'body{}' },
		} );

		expect( state.designAssets.home ).toBe( '<html></html>' );
		expect( state.designAssets.css ).toBe( 'body{}' );
		expect( state.designAssets.preview ).toBeUndefined();
	} );

	it( 'a reset delta discards everything folded so far', () => {
		const populated = foldFeedDelta( EMPTY_LIVE_BUILD_STATE, {
			events: [ { seq: 1, type: 'identity', data: { title: 'Old run' } } ],
		} );

		const afterReset = foldFeedDelta( populated, {
			reset: true,
			events: [ { seq: 1, type: 'identity', data: { title: 'New run' } } ],
		} );

		expect( afterReset.identity?.title ).toBe( 'New run' );
		expect( afterReset.sections ).toEqual( {} );
	} );

	it( 'ignores unknown event types and malformed payloads', () => {
		const state = foldFeedDelta( EMPTY_LIVE_BUILD_STATE, {
			events: [
				{ seq: 1, type: 'brand_new_thing', data: { anything: true } },
				{ seq: 2, type: 'palette', data: { colors: 'not-an-array' } },
				{ seq: 3, type: 'section', data: { part: 'section' } }, // no key
			],
		} );

		expect( state ).toEqual( EMPTY_LIVE_BUILD_STATE );
	} );
} );
