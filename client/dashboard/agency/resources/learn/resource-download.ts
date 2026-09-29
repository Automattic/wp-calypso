import type { LibraryResource } from './types';

type ResourceDownload = {
	url: string;
	filename?: string;
	exportFormat?: 'PDF' | 'XLSX';
	fetchFile?: boolean;
};

export function getResourceDownload( resource: LibraryResource ): ResourceDownload | undefined {
	let url: URL;
	try {
		url = new URL( resource.url );
	} catch {
		return;
	}
	if ( ! [ 'http:', 'https:' ].includes( url.protocol ) ) {
		return;
	}

	const googleDocument =
		url.hostname === 'docs.google.com' &&
		url.pathname.match( /^\/(document|presentation|spreadsheets)\/d\/([^/]+)/ );
	if ( googleDocument && googleDocument[ 2 ] !== 'e' ) {
		const [ , type, id ] = googleDocument;
		const format = type === 'spreadsheets' ? 'xlsx' : 'pdf';
		const target = new URL(
			`https://docs.google.com/${ type }/d/${ id }/export${ type === 'presentation' ? '/pdf' : '' }`
		);
		if ( type !== 'presentation' ) {
			target.searchParams.set( 'format', format );
		}
		const key = url.searchParams.get( 'resourcekey' );
		if ( key ) {
			target.searchParams.set( 'resourcekey', key );
		}
		return { url: target.href, exportFormat: format === 'pdf' ? 'PDF' : 'XLSX' };
	}

	if ( url.hostname === 'drive.google.com' ) {
		const id =
			url.pathname.match( /^\/file\/d\/([^/]+)/ )?.[ 1 ] ??
			( [ '/open', '/uc' ].includes( url.pathname ) ? url.searchParams.get( 'id' ) : null );
		if ( ! id ) {
			return;
		}
		const target = new URL( 'https://drive.google.com/uc' );
		target.searchParams.set( 'export', 'download' );
		target.searchParams.set( 'id', id );
		const key = url.searchParams.get( 'resourcekey' );
		if ( key ) {
			target.searchParams.set( 'resourcekey', key );
		}
		return { url: target.href };
	}

	const extension = url.pathname
		.match( /\.(pdf|mp4|webm|mov|mp3|wav|zip|pptx?|docx?|xlsx?|csv|png|jpe?g|webp)$/i )?.[ 1 ]
		.toLowerCase();
	if ( extension || resource.format === 'PDF' ) {
		return {
			url: url.href,
			filename: `${ resource.title }.${ extension ?? 'pdf' }`,
			fetchFile: extension === 'pdf' || ( ! extension && resource.format === 'PDF' ),
		};
	}
}
