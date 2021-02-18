/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import isSiteSupportingImageEditor from 'calypso/state/selectors/is-site-supporting-image-editor';

describe( 'isSiteSupportingImageEditor()', () => {
	test( 'should return true if site is not tracked', () => {
		const siteSupportsImageEditor = isSiteSupportingImageEditor(
			{
				sites: {
					items: {},
				},
				// isPrivateSite falls back on siteSettings.
				// An empty siteSettings object allows getSiteSettings to pass
				siteSettings: {},
			},
			2916284
		);

		expect( siteSupportsImageEditor ).to.be.true;
	} );

	test( 'should return true if site is public and not jetpack site', () => {
		const siteSupportsImageEditor = isSiteSupportingImageEditor(
			{
				sites: {
					items: {
						2916284: {
							ID: 2916284,
							name: 'example',
							is_private: false,
							jetpack: false,
						},
					},
				},
			},
			2916284
		);

		expect( siteSupportsImageEditor ).to.be.true;
	} );

	test( 'should return false if site is private', () => {
		const siteSupportsImageEditor = isSiteSupportingImageEditor(
			{
				sites: {
					items: {
						2916284: {
							ID: 2916284,
							name: 'example',
							is_private: true,
							jetpack: false,
						},
					},
				},
			},
			2916284
		);

		expect( siteSupportsImageEditor ).to.be.false;
	} );

	test( 'should return true if site is public and jetpack and has photon enabled', () => {
		const siteSupportsImageEditor = isSiteSupportingImageEditor(
			{
				sites: {
					items: {
						2916284: {
							ID: 2916284,
							name: 'example',
							is_private: false,
							jetpack: true,
							options: {
								active_modules: [ 'publicize', 'photon' ],
							},
						},
					},
				},
			},
			2916284
		);

		expect( siteSupportsImageEditor ).to.be.true;
	} );

	test( 'should return false if site is public and jetpack but has photon disabled', () => {
		const siteSupportsImageEditor = isSiteSupportingImageEditor(
			{
				sites: {
					items: {
						2916284: {
							ID: 2916284,
							name: 'example',
							is_private: false,
							jetpack: true,
							options: {
								active_modules: [ 'publicize' ],
							},
						},
					},
				},
			},
			2916284
		);

		expect( siteSupportsImageEditor ).to.be.false;
	} );
} );
