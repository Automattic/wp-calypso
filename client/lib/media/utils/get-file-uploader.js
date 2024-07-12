import debugFactory from 'debug';
import wpcom from 'calypso/lib/wp';

const debug = debugFactory( 'calypso:media' );

export const getFileUploader = ( file, siteId, postId, apiMetadata ) => {
	// Determine upload mechanism by object type
	const isUrl = 'string' === typeof file;

	const title = file.title;
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

	return wpcom.site( siteId ).addMediaFiles(
		{
			...( apiMetadata && { ...apiMetadata } ),
		},
		file
	);
};
