/**
 * External dependencies
 */
import debugFactory from 'debug';
import { EDITOR_POST_CURRENT_ID } from 'state/action-types';

const debug = debugFactory( 'calypso:ui:editor:post:actions' );

export function setEditingMode( mode, modeTitle, site ) {
	debug( 'setEditingMode', mode, modeTitle, site );
	return { type: 'TODO' };
}

export function startEditingNew( site, postOptions ) {
	debug( 'startEditingNew', site, postOptions );
	return {
		type: EDITOR_POST_CURRENT_ID,
		siteId: site.ID,
		postId: null
	};
}

export function startEditingExisting( site, postID ) {
	debug( 'startEditingExisting', site, postID );
	return {
		type: EDITOR_POST_CURRENT_ID,
		siteId: site.ID,
		postId: postID
	};
}

export function toggleStickyStatus( siteId, postId, currentStatus ) {
	debug( 'toggleStickyStatus', siteId, postId, currentStatus );
	return { type: 'TODO' };
}

export function togglePendingStatus( siteId, postId, currentStatus ) {
	debug( 'togglePendingStatus', siteId, postId, currentStatus );
	return { type: 'TODO' };
}

export function setAuthor( siteId, postId, newAuthor ) {
	debug( 'setAuthor', siteId, postId, newAuthor );
	return { type: 'TODO' };
}

export function setCategories( siteId, postId, newCategories ) {
	debug( 'setCategories', siteId, postId, newCategories );
	return { type: 'TODO' };
}

export function trashPost( siteId, postId, callback ) {
	debug( 'trashPost', siteId, postId, callback );
	return { type: 'TODO' };
}

export function setDiscussionSettings( siteId, postId, newSettings ) {
	debug( 'setDiscussionSettings', siteId, postId, newSettings );
	return { type: 'TODO' };
}

export function setExcerpt( siteId, postId, newExcerpt ) {
	debug( 'setExcerpt', siteId, postId, newExcerpt );
	return { type: 'TODO' };
}

export function setFeaturedImage( siteId, postId, newImage ) {
	debug( 'setFeaturedImage', siteId, postId, newImage );
	return { type: 'TODO' };
}

export function removeFeaturedImage( siteId, postId ) {
	debug( 'removeFeaturedImage', siteId, postId );
	return { type: 'TODO' };
}

export function setDate( siteId, postId, postDate ) {
	//Previous action was sending it formatted
	debug( 'setDate', postDate, ( postDate ? postDate.format() : null ) );
	return { type: 'TODO' };
}

export function setLocation( siteId, postId, latitude, longitude ) {
	debug( 'setLocation', siteId, postId, latitude, longitude );
	return { type: 'TODO' };
}

export function removeLocation( siteId, postId ) {
	debug( 'removeLocation', siteId, postId );
	return { type: 'TODO' };
}

export function setMenuOrder( siteId, postId, newOrder ) {
	debug( 'setMenuOrder', siteId, postId, newOrder );
	return { type: 'TODO' };
}

export function setPageParent( siteId, postId, newParentId ) {
	debug( 'setPageParent', siteId, postId, newParentId );
	return { type: 'TODO' };
}

export function setPageTemplate( siteId, postId, newTemplate ) {
	debug( 'setPageTemplate', siteId, postId, newTemplate );
	return { type: 'TODO' };
}

export function setPostFormat( siteId, postId, newFormat ) {
	debug( 'setPostFormat', siteId, postId, newFormat );
	return { type: 'TODO' };
}

export function addPublicizeConnectionKey( siteId, postId, newKeyID ) {
	debug( 'addPublicizeConnectionKey', siteId, postId, newKeyID );
	return { type: 'TODO' };
}

export function removePublicizeConnectionKey( siteId, postId ) {
	debug( 'removePublicizeConnectionKey', siteId, postId );
	return { type: 'TODO' };
}

export function setPublicizeMessage( siteId, postId, newMessage ) {
	debug( 'setPublicizeMessage', siteId, postId, newMessage );
	return { type: 'TODO' };
}

export function setSharingLikeOption( siteId, postId, optionKey, optionValue ) {
	debug( 'setSharingLikeOption', siteId, postId, optionKey, optionValue );
	return { type: 'TODO' };
}

export function setSlug( siteId, postId, newSlug ) {
	debug( 'setSlug', siteId, postId, newSlug );
	return { type: 'TODO' };
}

export function setTags( siteId, postId, newTags ) {
	debug( 'setTags', siteId, postId, newTags );
	return { type: 'TODO' };
}

export function setTitle( siteId, postId, newTitle ) {
	debug( 'setTitle', siteId, postId, newTitle );
	return { type: 'TODO' };
}

export function setPostPublic( siteId, postId ) {
	debug( 'setPostPublic', siteId, postId );
	return { type: 'TODO' };
}

export function setPostPrivate( siteId, postId ) {
	debug( 'setPostPrivate', siteId, postId );
	return { type: 'TODO' };
}

export function setPostPassword( siteId, postId, newPassword ) {
	debug( 'setPostPassword', siteId, postId, newPassword );
	return { type: 'TODO' };
}

export function setPostPasswordProtected( siteId, postId, newPassword ) {
	debug( 'setPostPasswordProtected', newPassword );
	return { type: 'TODO' };
}

export function setContent( siteId, postId, newContent ) {
	debug( 'setContent', siteId, postId, newContent );
	return { type: 'TODO' };
}

export function setRawContent( siteId, postId, htmlContent ) {
	debug( 'setRawContent', siteId, postId, htmlContent );
	return { type: 'TODO' };
}

export function resetRawContent( siteId, postId ) {
	debug( 'resetRawContent', siteId, postId );
	return { type: 'TODO' };
}

export function stopEditing( siteId, postId ) {
	debug( 'stopEditing', siteId, postId );
	return { type: 'TODO' };
}

export function save( siteId, postId, callback ) {
	debug( 'save', siteId, postId, callback );
	return { type: 'TODO' };
}

export function autosave( siteId, postId, callback ) {
	debug( 'autosave', siteId, postId, callback );
	return { type: 'TODO' };
}

export function setPostPublished( siteId, postId ) {
	debug( 'setPostPublished', siteId, postId );
	return { type: 'TODO' };
}

export const EDITING_MODES = {
	EXISTING: 'EDITING_MODE_EXISTING',
	NEW: 'EDITING_MODE_NEW'
};
