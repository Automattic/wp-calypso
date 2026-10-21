/**
 * @jest-environment jsdom
 */
import { getSeoExcerptForPost } from '../index';

describe( 'getSeoExcerptForPost()', () => {
	test( 'falls back to the excerpt when metadata is false (REST shape for a new post)', () => {
		// The REST API returns `false` for a new/draft post's metadata.
		const excerpt = getSeoExcerptForPost( {
			metadata: false,
			excerpt: 'Fallback excerpt',
			content: 'Body content',
		} );

		expect( excerpt ).toContain( 'Fallback excerpt' );
	} );

	test( 'prefers the advanced_seo_description metadata value when present', () => {
		const excerpt = getSeoExcerptForPost( {
			metadata: [ { key: 'advanced_seo_description', value: 'Custom SEO description' } ],
			excerpt: 'Fallback excerpt',
			content: 'Body content',
		} );

		expect( excerpt ).toContain( 'Custom SEO description' );
	} );
} );
