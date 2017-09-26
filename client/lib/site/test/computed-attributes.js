/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import getComputedAttributes from '../computed-attributes';

describe( 'getComputedAttributes()', () => {
	it( 'should not mutate the original object', () => {
		// This is enough for a test case because deepFreeze will throw an
		// error if an attempt is made to mutate the object
		getComputedAttributes( deepFreeze( {
			ID: 2916284,
			name: 'WordPress.com Example Blog',
			description: 'Just another WordPress.com weblog',
			URL: 'https://example.wordpress.com',
			jetpack: false,
			subscribers_count: 73,
			lang: false,
			logo: {
				id: 0,
				sizes: [],
				url: ''
			},
			options: {
				default_post_format: '0'
			},
			visible: null,
			is_private: false,
			is_following: false
		} ) );
	} );
} );
