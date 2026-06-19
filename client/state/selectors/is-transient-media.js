import getMediaItem from 'calypso/state/selectors/get-media-item';

export default function isTransientMedia( state, siteId, mediaId ) {
	return !! getMediaItem( state, siteId, mediaId )?.transient;
}
