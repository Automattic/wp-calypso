import { expect } from 'chai';
import { PREVIEW_SITE_SET } from 'calypso/state/action-types';
import { currentPreviewSiteId } from '../reducer';

describe( '#currentPreviewSiteId()', () => {
	test( 'should update currentPreviewSiteId', () => {
		const oldPreviewSiteId = 123;
		const newPreviewSiteId = 456;
		const state = currentPreviewSiteId( oldPreviewSiteId, {
			type: PREVIEW_SITE_SET,
			siteId: newPreviewSiteId,
		} );

		expect( state ).to.eql( newPreviewSiteId );
	} );
} );
