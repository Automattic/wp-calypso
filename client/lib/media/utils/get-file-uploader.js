import debugFactory from 'debug';
import wpcom from 'calypso/lib/wp';

const debug = debugFactory( 'calypso:media' );

const getMime = ( f ) => f?.type || f?.file?.type || f?.fileContents?.type || '';

const toTusFile = ( input ) => {
	if ( typeof File !== 'undefined' && input instanceof File ) {
		return input;
	}
	if ( typeof Blob !== 'undefined' && input instanceof Blob ) {
		// Bare blob, add a name 'upload'
		return new File( [ input ], 'upload', { type: input.type || 'application/octet-stream' } );
	}
	if ( input?.fileContents instanceof Blob ) {
		const blob = input.fileContents;
		const name = input.fileName || input.name || 'upload';
		return new File( [ blob ], name, {
			type: blob.type || input.type || 'application/octet-stream',
		} );
	}
	// Unknown, return what they gave us
	return input;
};

export const getFileUploader = ( file, siteId, postId ) => {
	// Determine upload mechanism by object type
	const isUrl = 'string' === typeof file;

	const title = file.title;

	if ( ! isUrl && file?.canUseVideoPress && getMime( file ).startsWith( 'video/' ) ) {
		const tusFile = toTusFile( file );
		return import(
			/* webpackChunkName: "tus-uploader" */ 'calypso/lib/media/uploaders/tus-uploader'
		).then( ( { default: TusUploader } ) => {
			const uploader = new TusUploader( wpcom, siteId );
			return uploader.startUpload( [ tusFile ] );
		} );
	}

	if ( postId ) {
		file = {
			parent_id: postId,
			[ isUrl ? 'url' : 'file' ]: file,
		};
	} else if ( file.fileContents ) {
		//if there's no parent_id, but the file object is wrapping a Blob
		//(contains fileContents, fileName etc) still wrap it in a new object
		file = {
			file: file,
		};
	}

	if ( title ) {
		file.title = title;
	}

	debug( 'Uploading media to %d from %o', siteId, file );

	if ( isUrl ) {
		return wpcom.site( siteId ).addMediaUrls( {}, file );
	}

	return wpcom.site( siteId ).addMediaFiles( {}, file );
};
