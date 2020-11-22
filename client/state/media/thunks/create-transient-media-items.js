/**
 * Internal dependencies
 */
import { createTransientMedia, validateMediaItem } from 'calypso/lib/media/utils';
import { getTransientDate, getBaseTime } from 'calypso/state/media/utils/transient-date';
import { createMediaItem, setMediaItemErrors } from 'calypso/state/media/actions';

/**
 * Create transient media items for all files and dispatch pre-upload
 * actions for all of them. This gives the impression of all the media
 * items being uploaded at the same time as it will put all the transient
 * items into the store together. Then we can upload serially without
 * each image popping in only when it is actually being uploaded.
 *
 * @param {object[]} files List of files to create transient items for
 * @param {object} site The site
 */
export function createTransientMediaItems( files, site ) {
	return ( dispatch ) => {
		const baseTime = getBaseTime();
		const fileCount = files.length;

		return files.map( ( file, index ) => {
			const transientDate = getTransientDate( baseTime, index, fileCount );

			const transientMedia = {
				date: transientDate,
				...createTransientMedia( file ),
			};

			if ( file.ID ) {
				transientMedia.ID = file.ID;
			}

			const { ID: siteId } = site;

			const errors = validateMediaItem( site, transientMedia );
			if ( errors?.length ) {
				dispatch( setMediaItemErrors( siteId, transientMedia.ID, errors ) );
				return;
			}

			dispatch( createMediaItem( site, transientMedia ) );

			return transientMedia;
		} );
	};
}
