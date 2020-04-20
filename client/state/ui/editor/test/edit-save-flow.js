/**
 * External dependencies
 */
// eslint-disable-next-line no-restricted-imports
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import nock from 'nock';

/**
 * Internal dependencies
 */
import posts from 'state/posts/reducer';
import preferences from 'state/preferences/reducer';
import sites from 'state/sites/reducer';
import siteSettings from 'state/site-settings/reducer';
import { selectedSiteId } from 'state/ui/reducer';
import editor from 'state/ui/editor/reducer';
import { setSelectedSiteId } from 'state/ui/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { editPost, saveEdited } from 'state/posts/actions';
import { startEditingNewPost } from 'state/ui/editor/actions';
import { getEditedPost, getEditedPostValue, isEditedPostDirty } from 'state/posts/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';

const SITE_ID = 123;
const POST_ID = 456;
const GLOBAL_ID = '123-456';

const reducer = combineReducers( {
	posts,
	preferences,
	sites,
	siteSettings,
	ui: combineReducers( {
		selectedSiteId,
		editor,
	} ),
} );

function createEditorStore() {
	return applyMiddleware( thunk )( createStore )( reducer );
}

// Returns object with two function properties:
// get( cb ):
//   takes a callback param, the callback will be fired after triggering
// trigger:
//   calling this function triggers the callback to be fired with node-style
//   arguments ( error, response )
function responseTrigger( response ) {
	let trigger;

	const triggerPromise = new Promise( ( resolve ) => {
		trigger = resolve;
	} );

	return {
		trigger,
		get: ( cb ) => triggerPromise.then( () => cb( null, response ) ),
	};
}

test( 'create new post and save when server returns identical content', async () => {
	const store = createEditorStore();

	// select site and start editing new post
	store.dispatch( setSelectedSiteId( SITE_ID ) );
	store.dispatch( startEditingNewPost( SITE_ID ) );

	// edit title and content
	const draftPostId = getEditorPostId( store.getState() );
	store.dispatch(
		editPost( SITE_ID, draftPostId, {
			title: 'Easy Title',
			content: 'Easy Content',
		} )
	);

	// mock the server response on save
	nock( 'https://public-api.wordpress.com' )
		.post( `/rest/v1.2/sites/${ SITE_ID }/posts/new?context=edit`, {
			type: 'post',
			status: 'draft',
			title: 'Easy Title',
			content: 'Easy Content',
		} )
		.reply( 200, {
			global_ID: GLOBAL_ID,
			site_ID: SITE_ID,
			ID: POST_ID,
			type: 'post',
			status: 'draft',
			title: 'Easy Title',
			content: 'Easy Content',
		} );

	// trigger save
	const saveResult = await store.dispatch( saveEdited() );

	// verify the save result
	expect( saveResult ).not.toBeNull();
	expect( saveResult.receivedPost.content ).toBe( 'Easy Content' );

	const savedPostId = getEditorPostId( store.getState() );

	// check the edited post's content
	const contentAfterSave = getEditedPostValue( store.getState(), SITE_ID, savedPostId, 'content' );
	expect( contentAfterSave ).toBe( 'Easy Content' );

	// check that post is not dirty
	expect( isEditedPostDirty( store.getState(), SITE_ID, savedPostId ) ).toBe( false );
} );

test( 'create new post and save when server transforms the content', async () => {
	const store = createEditorStore();

	// select site and start editing new post
	store.dispatch( setSelectedSiteId( SITE_ID ) );
	store.dispatch( startEditingNewPost( SITE_ID ) );

	// edit title and content
	const draftPostId = getEditorPostId( store.getState() );
	store.dispatch(
		editPost( SITE_ID, draftPostId, {
			title: 'Easy Title',
			content: '<span style="color: red;">Red</span>',
		} )
	);

	// mock the server response on save
	nock( 'https://public-api.wordpress.com' )
		.post( `/rest/v1.2/sites/${ SITE_ID }/posts/new?context=edit`, {
			type: 'post',
			status: 'draft',
			title: 'Easy Title',
			content: '<span style="color: red;">Red</span>',
		} )
		.reply( 200, {
			global_ID: GLOBAL_ID,
			site_ID: SITE_ID,
			ID: POST_ID,
			type: 'post',
			status: 'draft',
			title: 'Easy Title',
			content: '<span style="color:red;">Red</span>',
		} );

	// trigger save
	await store.dispatch( saveEdited() );

	const savedPostId = getEditorPostId( store.getState() );

	// check the edited post's content after save
	const contentAfterSave = getEditedPostValue( store.getState(), SITE_ID, savedPostId, 'content' );
	expect( contentAfterSave ).toBe( '<span style="color:red;">Red</span>' );

	// check that post is not dirty
	expect( isEditedPostDirty( store.getState(), SITE_ID, savedPostId ) ).toBe( false );
} );

test( 'create post, save, type while saving, verify that edits are not lost', async () => {
	const store = createEditorStore();

	// select site and start editing new post
	store.dispatch( setSelectedSiteId( SITE_ID ) );
	store.dispatch( startEditingNewPost( SITE_ID ) );

	// edit title and content
	const draftPostId = getEditorPostId( store.getState() );
	store.dispatch(
		editPost( SITE_ID, draftPostId, {
			title: 'Easy Title',
			content: '<span style="color: red;">Red</span>',
		} )
	);

	const responseSender = responseTrigger( {
		global_ID: GLOBAL_ID,
		site_ID: SITE_ID,
		ID: POST_ID,
		type: 'post',
		status: 'draft',
		title: 'Easy Title',
		content: '<span style="color:red;">Red</span>',
	} );

	// mock the server response on save
	nock( 'https://public-api.wordpress.com' )
		.post( `/rest/v1.2/sites/${ SITE_ID }/posts/new?context=edit`, {
			type: 'post',
			status: 'draft',
			title: 'Easy Title',
			content: '<span style="color: red;">Red</span>',
		} )
		.reply( 200, ( path, requestBody, cb ) => {
			// Response will be produced asynchronously and `responseSender` will call the callback
			// only after `trigger` is called. This way we make the request return a response at the
			// exact moment we desire.
			responseSender.get( cb );
		} );

	// trigger save
	const savePromise = store.dispatch( saveEdited() );

	// continue editing content
	store.dispatch(
		editPost( SITE_ID, draftPostId, {
			content: '<span style="color: red;">Red Dwarf</span>',
		} )
	);

	// let the save response arrive and be processed
	responseSender.trigger();
	await savePromise;

	const savedPostId = getEditorPostId( store.getState() );

	// check the edited post's content: edits-while-save must not be lost
	const contentAfterSave = getEditedPostValue( store.getState(), SITE_ID, savedPostId, 'content' );
	expect( contentAfterSave ).toBe( '<span style="color: red;">Red Dwarf</span>' );

	// check that post is still dirty
	expect( isEditedPostDirty( store.getState(), SITE_ID, savedPostId ) ).toBe( true );
} );

test( 'create new post and save, verify that edited post is always valid', async () => {
	const store = createEditorStore();

	// select site and start editing new post
	store.dispatch( setSelectedSiteId( SITE_ID ) );
	store.dispatch( startEditingNewPost( SITE_ID ) );

	// verify that the edited post is always non-null
	store.subscribe( () => {
		const state = store.getState();
		const siteId = getSelectedSiteId( state );
		const postId = getEditorPostId( state );
		const post = getEditedPost( state, siteId, postId );
		expect( post ).not.toBeNull();
	} );

	// edit title and content
	const draftPostId = getEditorPostId( store.getState() );
	store.dispatch( editPost( SITE_ID, draftPostId, { title: 'Title' } ) );

	// mock the server response on save
	nock( 'https://public-api.wordpress.com' )
		.post( `/rest/v1.2/sites/${ SITE_ID }/posts/new?context=edit`, {
			type: 'post',
			status: 'draft',
			title: 'Title',
			content: '',
		} )
		.reply( 200, {
			global_ID: GLOBAL_ID,
			site_ID: SITE_ID,
			ID: POST_ID,
			type: 'post',
			status: 'draft',
			title: 'Title',
		} );

	// trigger save
	await store.dispatch( saveEdited() );
} );
