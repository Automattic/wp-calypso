import { PREVIEW_URL_SET } from 'calypso/state/action-types';
import { currentPreviewSiteId } from '../reducer';

describe( '#currentPreviewSiteId()', () => {
	test( 'should update currentPreviewSiteId', () => {
		const oldPreviewSiteId = 123;
		const newPreviewSiteId = 456;
		const state = currentPreviewSiteId( oldPreviewSiteId, {
			type: PREVIEW_URL_SET,
			siteId: newPreviewSiteId,
		} );

		expect( state ).toEqual( newPreviewSiteId );
	} );
} );
