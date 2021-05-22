/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { currentPreviewSiteId } from '../reducer';
import { PREVIEW_SITE_SET } from 'calypso/state/action-types';

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
