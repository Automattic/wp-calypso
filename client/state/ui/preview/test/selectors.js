import { getPreviewSiteId } from '../selectors';

describe( 'getPreviewSiteId', () => {
	const currentPreviewSiteId = 123;
	const selectedSiteId = 456;

	test( 'should return the selected site id when not in "All My Sites" mode', () => {
		const state = {
			ui: {
				preview: {
					currentPreviewSiteId,
				},
				selectedSiteId,
			},
		};

		expect( getPreviewSiteId( state ) ).toEqual( selectedSiteId );
	} );

	test( 'should return the current preview site id when in "All My Sites" mode', () => {
		const state = {
			ui: {
				preview: {
					currentPreviewSiteId,
				},
				selectedSiteId: null,
			},
		};

		expect( getPreviewSiteId( state ) ).toEqual( currentPreviewSiteId );
	} );

	test( 'should return null when in "All My Sites" mode and the current preview site id is unset', () => {
		const state = {
			ui: {
				preview: {
					currentPreviewSiteId: null,
				},
				selectedSiteId: null,
			},
		};

		expect( getPreviewSiteId( state ) ).toBeNull();
	} );
} );
