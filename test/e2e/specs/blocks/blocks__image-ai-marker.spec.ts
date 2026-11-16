import fs from 'fs/promises';
import path from 'path';
import { DataHelper, ImageBlock, MediaHelper, TestFile } from '@automattic/calypso-e2e';
import { expect, skipIfNotTrunk, tags, test } from '../../lib/pw-base';
import { TEST_AI_MARKER_IMAGE_PATHS } from '../constants';
import type { APIRequestContext } from '@playwright/test';

const AI_DIGITAL_SOURCE_TYPE =
	'http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia';

// The last value stands in for a browser, which asks for AVIF first.
const ACCEPT_VALUES = [ '*/*', 'image/webp', 'image/avif,image/webp,*/*' ];

interface ServedCopy {
	url: string;
	accept: string;
	outcome: 'marker' | 'no marker' | 'no XMP' | 'not fetched';
	contentType: string;
	detail: string;
}

/**
 * Fetches an image, retrying a network error, a 404, a 429, a 5xx or a 2xx that is not an
 * image, so a brief outage or a file that is still propagating does not fail the test.
 */
async function fetchImage(
	request: APIRequestContext,
	url: string,
	accept: string
): Promise< { status: number; contentType: string; body: Buffer } > {
	for ( let attempt = 1; ; attempt++ ) {
		// The first attempt uses the URL as published; a retry adds an arg the edge cache has not seen.
		const attemptURL = new URL( url );
		if ( attempt > 1 ) {
			attemptURL.searchParams.set( 'retry', `${ attempt }` );
		}
		let failure: string;
		let retryable = true;
		try {
			const response = await request.get( attemptURL.href, {
				headers: { Accept: accept },
				timeout: 15_000,
			} );
			const status = response.status();
			const contentType = ( response.headers()[ 'content-type' ] ?? '' ).split( ';' )[ 0 ];
			if ( response.ok() && contentType.startsWith( 'image/' ) ) {
				return { status, contentType, body: await response.body() };
			}
			failure = `responded ${ status } ${ contentType }`;
			retryable = response.ok() || status === 404 || status === 429 || status >= 500;
		} catch ( error ) {
			failure = `failed: ${ ( error as Error ).message }`;
		}
		if ( ! retryable || attempt === 3 ) {
			throw new Error(
				`${ attemptURL.href } (Accept: ${ accept }) ${ failure } on attempt ${ attempt }`
			);
		}
		await new Promise( ( resolve ) => setTimeout( resolve, 2_000 * attempt ) );
	}
}

/**
 * Fetches one served copy of an image and reports whether its XMP carries the AI marker.
 */
async function checkServedCopy(
	request: APIRequestContext,
	url: string,
	accept: string
): Promise< ServedCopy > {
	try {
		const { status, contentType, body } = await fetchImage( request, url, accept );
		let outcome: ServedCopy[ 'outcome' ] = 'no XMP';
		if ( MediaHelper.xmpIncludes( body, AI_DIGITAL_SOURCE_TYPE ) ) {
			outcome = 'marker';
		} else if ( MediaHelper.xmpIncludes( body, '<x:xmpmeta' ) ) {
			outcome = 'no marker';
		}
		const detail = `${ url } (Accept: ${ accept }, ${ status } ${ contentType }, ${ body.length } bytes, ${ outcome })`;
		return { url, accept, outcome, contentType, detail };
	} catch ( error ) {
		const detail = ( error as Error ).message;
		return { url, accept, outcome: 'not fetched', contentType: '', detail };
	}
}

/**
 * An image marked as AI-generated has to reach readers with its XMP marker in each size and
 * format the post serves; a C2PA manifest check waits on PERFOPS-326.
 */
test.describe( 'Blocks: Image (AI marker)', { tag: [ tags.GUTENBERG ] }, () => {
	skipIfNotTrunk();

	test( 'As a user, I can publish AI-generated images that keep their XMP marker', async ( {
		page,
		pageEditor,
		request,
		accountGivenByEnvironment,
	}, testInfo ) => {
		// Two uploads, a publish round-trip and the image fetches exceed the default 2-minute budget.
		test.setTimeout( 240 * 1000 );

		let imageFiles: TestFile[];

		await test.step( `Given I am authenticated as '${ accountGivenByEnvironment.accountName }'`, async () => {
			await accountGivenByEnvironment.authenticate( page );
		} );

		await test.step( 'And I have image files marked as AI-generated', async () => {
			imageFiles = await Promise.all(
				TEST_AI_MARKER_IMAGE_PATHS.map( ( imagePath ) =>
					MediaHelper.createTestFile( imagePath, {
						postfix: `ai-marker-${ path.extname( imagePath ).slice( 1 ) }`,
					} )
				)
			);
			const markedFiles = await Promise.all(
				imageFiles.map( async ( { fullpath } ) =>
					MediaHelper.xmpIncludes( await fs.readFile( fullpath ), AI_DIGITAL_SOURCE_TYPE )
				)
			);
			expect( markedFiles, 'Files to upload that carry the AI marker' ).toEqual( [ true, true ] );
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
						ACCEPT_VALUES.map( ( accept ) => checkServedCopy( request, url, accept ) )
					)
				);
				await testInfo.attach( `served-copies${ path.extname( imagePath ) }.json`, {
					body: JSON.stringify( { post: page.url(), copies }, null, 2 ),
					contentType: 'application/json',
				} );

				expect
					.soft(
						copies
							.filter( ( copy ) => copy.outcome === 'not fetched' )
							.map( ( copy ) => copy.detail ),
						'Served copies that could not be fetched'
					)
					.toEqual( [] );
				expect
					.soft(
						copies
							.filter( ( copy ) => [ 'no marker', 'no XMP' ].includes( copy.outcome ) )
							.map( ( copy ) => copy.detail ),
						'Served copies without the AI marker'
					)
					.toEqual( [] );
				expect
					.soft(
						copies
							.filter( ( copy ) => copy.accept === 'image/webp' )
							.map( ( copy ) => copy.contentType ),
						'Content types served for Accept: image/webp'
					)
					.toContain( 'image/webp' );
			} );
		}
	} );
} );
