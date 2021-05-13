/**
 * Internal dependencies
 */
import isSiteUsingFullSiteEditing from '../is-site-using-full-site-editing';

describe( 'isSiteUsingFullSiteEditing', () => {
	test( 'returns false if site does not exist', () => {
		const state = { sites: { items: {} } };
		const isFSE = isSiteUsingFullSiteEditing( state, 1 );
		expect( isFSE ).toBe( false );
	} );

	test( 'returns true if site exists, has is_fse_active true, and page_on_front', () => {
		const state = {
			sites: {
				items: {
					123: {
						is_fse_active: true,
						options: {
							show_on_front: 'page',
							page_on_front: 2,
						},
					},
				},
			},
		};
		const isFSE = isSiteUsingFullSiteEditing( state, 123 );
		expect( isFSE ).toBe( true );
	} );

	test( 'returns false if site exists, has is_fse_active true and no page_on_front,', () => {
		const state = {
			sites: {
				items: {
					123: {
						is_fse_active: true,
						options: {
							show_on_front: 'posts',
							page_on_front: 0,
						},
					},
				},
			},
		};
		const isFSE = isSiteUsingFullSiteEditing( state, 123 );
		expect( isFSE ).toBe( false );
	} );

	test( 'returns false if site exists, has no is_fse_active prop, and page_on_front', () => {
		const state = {
			sites: {
				items: {
					123: {
						options: {
							show_on_front: 'page',
							page_on_front: 2,
						},
					},
				},
			},
		};
		const isFSE = isSiteUsingFullSiteEditing( state, 123 );
		expect( isFSE ).toBe( false );
	} );
} );
