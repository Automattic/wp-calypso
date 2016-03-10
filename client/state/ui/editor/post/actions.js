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

export function trashPost( post, callback ) {
	debug( 'trashPost', post, callback );
	return { type: 'TODO' };
}

export function setDiscussionSettings( newSettings ) {
	debug( 'setDiscussionSettings', newSettings );
	return { type: 'TODO' };
}

export function setExcerpt( newExcerpt ) {
	debug( 'setExcerpt', newExcerpt );
	return { type: 'TODO' };
}

export function setFeaturedImage( newImage ) {
	debug( 'setFeaturedImage', newImage );
	return { type: 'TODO' };
}

export function removeFeaturedImage() {
	debug( 'removeFeaturedImage' );
	return { type: 'TODO' };
}

export function setDate( postDate ) {
	//Previous action was sending it formatted
	debug( 'setDate', postDate, ( postDate ? postDate.format() : null ) );
	return { type: 'TODO' };
}

export function setLocation( latitude, longitude ) {
	debug( 'setLocation', latitude, longitude );
	return { type: 'TODO' };
}

export function removeLocation() {
	debug( 'removeLocation' );
	return { type: 'TODO' };
}

export function setMenuOrder( newOrder ) {
	debug( 'setMenuOrder', newOrder );
	return { type: 'TODO' };
}

export function setPageParent( newParentId ) {
	debug( 'setPageParent', newParentId );
	return { type: 'TODO' };
}

export function setPageTemplate( newTemplate ) {
	debug( 'setPageTemplate', newTemplate );
	return { type: 'TODO' };
}

export function setPostFormat( newFormat ) {
	debug( 'setPostFormat', newFormat );
	return { type: 'TODO' };
}

export function addPublicizeConnectionKey( newKeyID ) {
	debug( 'addPublicizeConnectionKey', newKeyID );
	return { type: 'TODO' };
}

export function removePublicizeConnectionKey() {
	debug( 'removePublicizeConnectionKey' );
	return { type: 'TODO' };
}

export function setPublicizeMessage( newMessage ) {
	debug( 'setPublicizeMessage', newMessage );
	return { type: 'TODO' };
}

export function setSharingLikeOption( optionKey, optionValue ) {
	debug( 'setSharingLikeOption', optionKey, optionValue );
	return { type: 'TODO' };
}

export function setSlug( newSlug ) {
	debug( 'setSlug', newSlug );
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

export function setPostPublic() {
	debug( 'setPostPublic' );
	return { type: 'TODO' };
}

export function setPostPrivate() {
	debug( 'setPostPrivate' );
	return { type: 'TODO' };
}

export function setPostPassword( newPassword ) {
	debug( 'setPostPassword', newPassword );
	return { type: 'TODO' };
}

export function setPostPasswordProtected( newPassword ) {
	debug( 'setPostPasswordProtected', newPassword );
	return { type: 'TODO' };
}

export function setContent( newContent ) {
	debug( 'setContent', newContent );
	return { type: 'TODO' };
}

export function setRawContent( htmlContent ) {
	debug( 'setRawContent', htmlContent );
	return { type: 'TODO' };
}

export function resetRawContent() {
	debug( 'resetRawContent' );
	return { type: 'TODO' };
}

export function stopEditing() {
	debug( 'stopEditing' );
	return { type: 'TODO' };
}

export function save( callback ) {
	debug( 'save', callback );
	return { type: 'TODO' };
}

export function autosave( callback ) {
	debug( 'autosave', callback );
	return { type: 'TODO' };
}

export function setPostPublished() {
	debug( 'setPostPublished' );
	return { type: 'TODO' };
}

export const EDITING_MODES = {
	EXISTING: 'EDITING_MODE_EXISTING',
	NEW: 'EDITING_MODE_NEW'
};
