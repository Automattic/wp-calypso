/**
 * External dependencies
 */
import { escape } from 'lodash';

interface MediaCacheItem {
	id: number;
	dataUrl: string;
	file: File;
}

const mediaCache: Record< number, MediaCacheItem > = {};

let nextImageId = 1;

const DEFAULT_MEDIA_RESPONSE = {
	id: 0,
	// Server returns strings with no TZ, but toISOString() does have TZ. Should be fine for logged-out editor
	date: new Date().toISOString(),
	date_gmt: new Date().toISOString(),
	modified: new Date().toISOString(),
	modified_gmt: new Date().toISOString(),
	guid: { rendered: '', raw: '' },
	slug: '',
	status: 'inherit',
	type: 'attachment',
	link: '', // Not sure where this is supposed to link to, looks like https://example.wordpress.com/fileslug
	title: {
		raw: '',
		rendered: '',
	},
	author: 1,
	comment_status: 'open',
	ping_status: 'closed',
	template: '',
	meta: {
		_coblocks_attr: '',
		_coblocks_dimensions: '',
		_coblocks_responsive_height: '',
		_coblocks_accordion_ie_support: '',
		advanced_seo_description: '',
		amp_status: '',
		spay_email: '',
	},
	permalink_template: '', // Hopefully we can ignore this, don't think it appears in the editor, looks like https://example.wordpress.com/?attachment_id=1
	generated_slug: '',
	jetpack_shortlink: '', // Maybe some advanced Jetpack blocks use this? Looks like https://wp.me/a-short-code
	jetpack_sharing_enabled: true,
	jetpack_likes_enabled: true,
	description: {
		raw: '',
		rendered: '', // Not sure where this is used in the editor, but it looks like a long string of html, maybe describing properties like what's in the media modal?
	},
	caption: {
		raw: '',
		rendered: '',
	},
	alt_text: '',
	media_type: '',
	mime_type: '',
	media_details: {
		width: 0,
		height: 0,
		file: '',
		sizes: {
			// Server also provides "thumbnail", "medium" and "large" versions. We'll only provide "full".
			full: {
				file: '',
				width: 0,
				height: 0,
				mime_type: '',
				source_url: '',
			},
		},
		image_meta: {
			aperture: '0',
			credit: '',
			camera: '',
			caption: '',
			created_timestamp: '0',
			copyright: '',
			focal_length: '0',
			iso: '0',
			shutter_speed: '0',
			title: '',
			orientation: '1',
			keywords: [],
		},
		filesize: 0,
	},
	post: null,
	source_url: '',
	missing_image_sizes: [],
	_links: {}, // Server usually provides a bunch of links here, like to the media library
};

export async function createMedia( request: Request ): Promise< Response > {
	const formData = await request.formData();
	const file = formData.get( 'file' );
	if ( ! ( file instanceof File ) ) {
		throw new Error();
	}

	const dataUrl = await new Promise< string >( ( resolve, reject ) => {
		const reader = new FileReader();
		reader.addEventListener( 'load', () => {
			// Casting is ok here because we know we've called `readerAsDataURL()`
			resolve( reader.result as string );
		} );
		reader.addEventListener( 'error', reject );
		reader.readAsDataURL( file );
	} );

	const id = nextImageId++;

	const cacheItem = { id, dataUrl, file };
	mediaCache[ id ] = cacheItem;

	const responseBody = await createMediaRestObject( cacheItem );

	return new Response( JSON.stringify( responseBody ), {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
		},
	} );
}

export async function readMedia( request: Request ): Promise< Response > {
	const { pathname } = new URL( request.url );
	const idAsString = pathname.substr( '/wp/v2/media/'.length );
	const id = parseInt( idAsString, 10 );

	const responseBody = await createMediaRestObject( mediaCache[ id ] );

	return new Response( JSON.stringify( responseBody ), {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
		},
	} );
}

async function createMediaRestObject( { dataUrl, file, id }: MediaCacheItem ) {
	const fileName = file.name || file.type.replace( '/', '.' );
	const fileNameNoSuffix = fileName.substr( fileName.lastIndexOf( '.' ) );

	const { width, height } = await createImageBitmap( file );

	return {
		...DEFAULT_MEDIA_RESPONSE,
		id,
		source_url: dataUrl,
		guid: { rendered: dataUrl, raw: dataUrl },
		slug: fileNameNoSuffix,
		title: {
			raw: fileNameNoSuffix,
			rendered: escape( fileNameNoSuffix ),
		},
		generated_slug: fileNameNoSuffix,
		media_type: file.type.substr( 0, file.type.indexOf( '/' ) ),
		mime_type: file.type,
		filesize: file.size,
		media_details: {
			...DEFAULT_MEDIA_RESPONSE.media_details,
			width,
			height,
			file: fileName,
			sizes: {
				...DEFAULT_MEDIA_RESPONSE.media_details.sizes,
				full: {
					file: fileName,
					width,
					height,
					mime_type: file.type,
					source_url: dataUrl,
				},
			},
		},
	};
}
