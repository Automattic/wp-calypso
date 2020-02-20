/**
 * Internal dependencies
 */
import isIframeForHtmlElement from '../is-iframe-for-html-element';

describe( 'isIframeForHtmlElement()', () => {
	test( 'should be true when in `gutenberg-editor` section with a siteId', () => {
		const state = {
			ui: {
				section: {
					name: 'gutenberg-editor',
				},
				selectedSiteId: 1701,
			},
		};
		expect( isIframeForHtmlElement( state ) ).toBe( true );
	} );

	test( 'should be false when in `gutenberg-editor` section without a siteId', () => {
		const state = {
			ui: {
				section: {
					name: 'gutenberg-editor',
				},
			},
		};
		expect( isIframeForHtmlElement( state ) ).toBe( false );
	} );

	test( 'should be false when in other section', () => {
		const state = {
			ui: {
				section: {
					name: 'Section 31',
				},
				selectedSiteId: 1701,
			},
		};
		expect( isIframeForHtmlElement( state ) ).toBe( false );
	} );
} );
