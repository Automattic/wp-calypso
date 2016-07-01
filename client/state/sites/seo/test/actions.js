/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { SEO_TITLE_SET } from 'state/action-types';
import { setTitleFormat } from '../actions';

describe( 'actions', () => {
	describe( '#setTitleFormat()', () => {
		it( 'should return required structure', () => {
			const siteId   = 1;
			const pageType = 'frontPage';
			const format   = '%site_name% | %tagline%';

			expect( setTitleFormat( siteId, pageType, format ) ).to.eql( {
				type: SEO_TITLE_SET,
				siteId,
				pageType,
				format
			} );
		} );
	} );
} );
