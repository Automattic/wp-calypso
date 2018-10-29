/**
 * External dependencies
 */
import { reduce } from 'lodash';

/**
 * WordPress dependencies
 */
import { select, subscribe, dispatch } from '@wordpress/data';
import { speak } from '@wordpress/a11y';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies
 */
import {
	metaBoxUpdatesSuccess,
	requestMetaBoxUpdates,
	openGeneralSidebar,
	closeGeneralSidebar,
} from './actions';
import {
	getActiveMetaBoxLocations,
	getActiveGeneralSidebarName,
} from './selectors';
import { getMetaBoxContainer } from '../utils/meta-boxes';
import { onChangeListener } from './utils';

const effects = {
	SET_META_BOXES_PER_LOCATIONS( action, store ) {
		// Allow toggling metaboxes panels
		// We need to wait for all scripts to load
		// If the meta box loads the post script, it will already trigger this.
		// After merge in Core, make sure to drop the timeout and update the postboxes script
		// to avoid the double binding.
		setTimeout( () => {
			const postType = select( 'core/editor' ).getCurrentPostType();
			if ( window.postboxes.page !== postType ) {
				window.postboxes.add_postbox_toggles( postType );
			}
		} );

		let wasSavingPost = select( 'core/editor' ).isSavingPost();
		let wasAutosavingPost = select( 'core/editor' ).isAutosavingPost();
		// Save metaboxes when performing a full save on the post.
		subscribe( () => {
			const isSavingPost = select( 'core/editor' ).isSavingPost();
			const isAutosavingPost = select( 'core/editor' ).isAutosavingPost();
			const hasActiveMetaBoxes = select( 'core/edit-post' ).hasMetaBoxes();

			// Save metaboxes on save completion when past save wasn't an autosave.
			const shouldTriggerMetaboxesSave = (
				hasActiveMetaBoxes &&
				wasSavingPost &&
				! wasAutosavingPost &&
				! isSavingPost &&
				! isAutosavingPost
			);

			// Save current state for next inspection.
			wasSavingPost = isSavingPost;
			wasAutosavingPost = isAutosavingPost;

			if ( shouldTriggerMetaboxesSave ) {
				store.dispatch( requestMetaBoxUpdates() );
			}
		} );
	},
	REQUEST_META_BOX_UPDATES( action, store ) {
		const state = store.getState();

		// Additional data needed for backwards compatibility.
		// If we do not provide this data, the post will be overridden with the default values.
		const post = select( 'core/editor' ).getCurrentPost( state );
		const additionalData = [
			post.comment_status ? [ 'comment_status', post.comment_status ] : false,
			post.ping_status ? [ 'ping_status', post.ping_status ] : false,
			post.sticky ? [ 'sticky', post.sticky ] : false,
			[ 'post_author', post.author ],
		].filter( Boolean );

		// We gather all the metaboxes locations data and the base form data
		const baseFormData = new window.FormData( document.querySelector( '.metabox-base-form' ) );
		const formDataToMerge = [
			baseFormData,
			...getActiveMetaBoxLocations( state ).map( ( location ) => (
				new window.FormData( getMetaBoxContainer( location ) )
			) ),
		];

		// Merge all form data objects into a single one.
		const formData = reduce( formDataToMerge, ( memo, currentFormData ) => {
			for ( const [ key, value ] of currentFormData ) {
				memo.append( key, value );
			}
			return memo;
		}, new window.FormData() );
		additionalData.forEach( ( [ key, value ] ) => formData.append( key, value ) );

		// Save the metaboxes
		apiFetch( {
			url: window._wpMetaBoxUrl,
			method: 'POST',
			body: formData,
			parse: false,
		} )
			.then( () => store.dispatch( metaBoxUpdatesSuccess() ) );
	},
	SWITCH_MODE( action ) {
		// Unselect blocks when we switch to the code editor.
		if ( action.mode !== 'visual' ) {
			dispatch( 'core/editor' ).clearSelectedBlock();
		}

		const message = action.mode === 'visual' ? __( 'Visual editor selected' ) : __( 'Code editor selected' );
		speak( message, 'assertive' );
	},
	INIT( _, store ) {
		// Select the block settings tab when the selected block changes
		subscribe( onChangeListener(
			() => !! select( 'core/editor' ).getBlockSelectionStart(),
			( hasBlockSelection ) => {
				if ( ! select( 'core/edit-post' ).isEditorSidebarOpened() ) {
					return;
				}
				if ( hasBlockSelection ) {
					store.dispatch( openGeneralSidebar( 'edit-post/block' ) );
				} else {
					store.dispatch( openGeneralSidebar( 'edit-post/document' ) );
				}
			} )
		);

		const isMobileViewPort = () => select( 'core/viewport' ).isViewportMatch( '< medium' );
		const adjustSidebar = ( () => {
			// contains the sidebar we close when going to viewport sizes lower than medium.
			// This allows to reopen it when going again to viewport sizes greater than medium.
			let sidebarToReOpenOnExpand = null;
			return ( isSmall ) => {
				if ( isSmall ) {
					sidebarToReOpenOnExpand = getActiveGeneralSidebarName( store.getState() );
					if ( sidebarToReOpenOnExpand ) {
						store.dispatch( closeGeneralSidebar() );
					}
				} else if ( sidebarToReOpenOnExpand && ! getActiveGeneralSidebarName( store.getState() ) ) {
					store.dispatch( openGeneralSidebar( sidebarToReOpenOnExpand ) );
				}
			};
		} )();

		adjustSidebar( isMobileViewPort() );

		// Collapse sidebar when viewport shrinks.
		// Reopen sidebar it if viewport expands and it was closed because of a previous shrink.
		subscribe( onChangeListener( isMobileViewPort, adjustSidebar ) );
	},

};

export default effects;
