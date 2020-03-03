/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isRequestingPageTemplates, getPageTemplates } from '../selectors';

describe( 'selectors', () => {
	describe( 'isRequestingPageTemplates()', () => {
		test( 'should return false if the site is not tracked', () => {
			const isRequesting = isRequestingPageTemplates(
				{
					pageTemplates: {
						requesting: {},
					},
				},
				2916284
			);

			expect( isRequesting ).to.be.false;
		} );

		test( 'should return true if a request is in progress for the site', () => {
			const isRequesting = isRequestingPageTemplates(
				{
					pageTemplates: {
						requesting: {
							2916284: true,
						},
					},
				},
				2916284
			);

			expect( isRequesting ).to.be.true;
		} );

		test( 'should return false if a request has completed for the site', () => {
			const isRequesting = isRequestingPageTemplates(
				{
					pageTemplates: {
						requesting: {
							2916284: false,
						},
					},
				},
				2916284
			);

			expect( isRequesting ).to.be.false;
		} );
	} );

	describe( 'getPageTemplates()', () => {
		test( 'should return null if the site is not tracked', () => {
			const templates = getPageTemplates(
				{
					pageTemplates: {
						items: {},
					},
				},
				2916284
			);

			expect( templates ).to.be.null;
		} );

		test( 'should return the page templates for the site', () => {
			const templates = getPageTemplates(
				{
					pageTemplates: {
						items: {
							2916284: [ { label: 'Full Width', file: 'fullwidth.php' } ],
						},
					},
				},
				2916284
			);

			expect( templates ).to.eql( [ { label: 'Full Width', file: 'fullwidth.php' } ] );
		} );
	} );
} );
