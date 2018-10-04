/**
 * WordPress dependencies
 */
import { select, subscribe } from '@wordpress/data';
import { speak } from '@wordpress/a11y';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import {
	openGeneralSidebar,
	closeGeneralSidebar,
} from './actions';
import { getActiveGeneralSidebarName } from './selectors';
import { onChangeListener } from './utils';

const effects = {
	SWITCH_MODE( action ) {
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
