/**
 * External dependencies
 */
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:ui:editor:post:actions' );

export function setEditingMode( mode, modeTitle, site ) {
	debug( 'setEditingMode', mode, modeTitle, site );
	return { type: 'TODO' };
}

export function startEditingNew( site, postOptions ) {
	debug( 'startEditingNew', site, postOptions );
	return { type: 'TODO' };
}

export function startEditingExisting( site, postID ) {
	debug( 'startEditingExisting', site, postID );
	return { type: 'TODO' };
}

export function toggleStickyStatus( currentStatus ) {
	debug( 'toggleStickyStatus', currentStatus );
	return { type: 'TODO' };
}

export function togglePendingStatus( currentStatus ) {
	debug( 'togglePendingStatus', currentStatus );
	return { type: 'TODO' };
}

export function setAuthor( newAuthor ) {
	debug( 'setAuthor', newAuthor );
	return { type: 'TODO' };
}

export function setCategories( newCategories ) {
	debug( 'setCategories', newCategories );
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

export const EDITING_MODES = {
	EXISTING: 'EDITING_MODE_EXISTING',
	NEW: 'EDITING_MODE_NEW'
};
