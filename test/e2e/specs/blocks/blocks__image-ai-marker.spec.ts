import path from 'path';
import { DataHelper, ImageBlock, MediaHelper, TestFile } from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';
import { TEST_AI_MARKER_IMAGE_PATHS } from '../constants';
import type { APIRequestContext } from '@playwright/test';

const AI_DIGITAL_SOURCE_TYPE =
	'http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia';

// AVIF is left out because the image service answers an AVIF request with WebP.
const ACCEPT_HEADERS = [ '*/*', 'image/webp' ];

/**
 * Fetches an image, retrying a network error, a 404, a 429, a 5xx or a 200 that is not an
 * image, so a brief outage or a file that is still propagating does not read as a missing
 * marker.
 */
async function fetchImage(
	request: APIRequestContext,
	url: string,
	accept: string
): Promise< { body: Buffer; contentType: string } > {
	for ( let attempt = 1; ; attempt++ ) {
		let failure: string;
		let retry = attempt < 3;
		// The first attempt uses the URL as published; a retry adds an arg to get past a cached error.
		const attemptURL = new URL( url );
		if ( attempt > 1 ) {
			attemptURL.searchParams.set( 'retry', `${ attempt }` );
		}
		try {
			const response = await request.get( attemptURL.href, {
				headers: { Accept: accept },
				timeout: 15_000,
			} );
			const status = response.status();
			const contentType = ( response.headers()[ 'content-type' ] ?? '' ).split( ';' )[ 0 ];
			if ( response.ok() && contentType.startsWith( 'image/' ) ) {
				return { body: await response.body(), contentType };
			}
			failure = `responded ${ status } ${ contentType }`;
			retry &&= response.ok() || status === 404 || status === 429 || status >= 500;
		} catch ( error ) {
			failure = `failed: ${ ( error as Error ).message }`;
		}
		if ( ! retry ) {
			throw new Error( `${ url } ${ failure }` );
		}
		await new Promise( ( resolve ) => setTimeout( resolve, 2_000 * attempt ) );
	}
}

/**
 * An image marked as AI-generated has to reach readers with that marker, whatever size or
 * format they are served. Only the XMP marker is asserted here; a C2PA manifest check
 * belongs in this spec once PERFOPS-326 settles what a resized image carries.
 */
test.describe( 'Blocks: Image (AI marker)', { tag: [ tags.GUTENBERG ] }, () => {
	test( 'As a user, I can publish AI-generated images that keep their XMP marker', async ( {
		page,
		pageEditor,
		request,
		accountGivenByEnvironment,
	} ) => {
		test.setTimeout( 240 * 1000 );

		let imageFiles: TestFile[];

		await test.step( 'Given I have image files marked as AI-generated', async () => {
			imageFiles = await Promise.all(
				TEST_AI_MARKER_IMAGE_PATHS.map( ( imagePath ) =>
					MediaHelper.createTestFile( imagePath, {
						postfix: `ai-marker-${ path.extname( imagePath ).slice( 1 ) }`,
					} )
				)
			);
		} );

		await test.step( 'When I go to the new post page', async () => {
			const siteSlug = accountGivenByEnvironment.getSiteURL( { protocol: false } );
			await pageEditor.visit( 'post', { siteSlug } );
			await pageEditor.enterTitle( DataHelper.getRandomPhrase() );
		} );

		for ( const [ index, imagePath ] of TEST_AI_MARKER_IMAGE_PATHS.entries() ) {
			await test.step( `And I upload the ${ path.extname( imagePath ) } file to an ${
				ImageBlock.blockName
			} block`, async () => {
				const blockHandle = await pageEditor.addBlockFromSidebar(
					ImageBlock.blockName,
					ImageBlock.blockEditorSelector,
					{ noSearch: true }
				);
				await new ImageBlock( page, blockHandle ).upload( imageFiles[ index ].fullpath );
			} );
		}

		await test.step( 'And I publish the post', async () => {
			await pageEditor.publish( { visit: true } );
		} );

		for ( const [ index, imagePath ] of TEST_AI_MARKER_IMAGE_PATHS.entries() ) {
			await test.step( `Then every served copy of the ${ path.extname(
				imagePath
			) } image has the AI marker`, async () => {
				const { filename } = imageFiles[ index ];
				await ImageBlock.validatePublishedContent( page, [ filename ] );
				const urls = await ImageBlock.getPublishedImageURLs( page, filename );
				expect( urls.length, 'URLs in src and srcset' ).toBeGreaterThan( 1 );

				// The request fixture holds no cookies, so each copy is fetched as a logged-out reader gets it.
				const copies = await Promise.all(
					urls.flatMap( ( url ) =>
						ACCEPT_HEADERS.map( async ( accept ) => {
							const { body, contentType } = await fetchImage( request, url, accept );
							return {
								description: `${ url } (Accept: ${ accept }, served as ${ contentType })`,
								accept,
								contentType,
								marked: MediaHelper.xmpIncludes( body, AI_DIGITAL_SOURCE_TYPE ),
							};
						} )
					)
				);

				expect
					.soft(
						copies.filter( ( copy ) => ! copy.marked ).map( ( copy ) => copy.description ),
						'Served copies without the AI marker'
					)
					.toEqual( [] );
				expect(
					copies
						.filter( ( copy ) => copy.accept === 'image/webp' )
						.map( ( copy ) => copy.contentType ),
					'Content types served for Accept: image/webp'
				).toContain( 'image/webp' );
			} );
		}
	} );
} );
