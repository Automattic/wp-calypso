/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import isTransientMedia from 'calypso/state/selectors/is-transient-media';
import MediaQueryManager from 'calypso/lib/query-manager/media';

describe( 'isTransientMedia()', () => {
	test( 'should return false if the media is not known', () => {
		const isTransient = isTransientMedia(
			{
				media: {
					queries: {},
				},
			},
			2916284,
			42
		);

		expect( isTransient ).to.be.false;
	} );

	test( 'should return false if the media has no transient flag', () => {
		const isTransient = isTransientMedia(
			{
				media: {
					queries: {
						2916284: new MediaQueryManager( {
							items: {
								42: { ID: 42, title: 'flowers', URL: 'https://testing.com/flowers.jpg' },
							},
						} ),
					},
				},
			},
			2916284,
			42
		);

		expect( isTransient ).to.be.false;
	} );

	test( 'should return the true if truthy transient flag on media', () => {
		const isTransient = isTransientMedia(
			{
				media: {
					queries: {
						2916284: new MediaQueryManager( {
							items: {
								42: {
									ID: 42,
									title: 'flowers',
									URL: 'https://testing.com/flowers.jpg',
									transient: true,
								},
							},
						} ),
					},
				},
			},
			2916284,
			42
		);

		expect( isTransient ).to.be.true;
	} );
} );
