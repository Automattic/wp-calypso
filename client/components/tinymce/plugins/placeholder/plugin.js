/**
 * External dependencies
 */

import tinymce from 'tinymce/tinymce';

/**
 * Module variables
 */

const REGEXP_EMPTY_CONTENT = /^<p>(<br[^>]*>|&nbsp;|\s)*<\/p>$/;

function hasContent( content ) {
	return content.length && ! REGEXP_EMPTY_CONTENT.test( content );
}

function placeholder( editor ) {
	const element = editor.getElement();
	if ( ! element.hasAttribute( 'placeholder' ) ) {
		return;
	}

	let isShowingPlaceholder = false;
	function toggleShowingPlaceholder( state ) {
		if ( state === isShowingPlaceholder ) {
			return;
		}

		isShowingPlaceholder = state;
		editor.dom.toggleClass( editor.getBody(), 'is-showing-placeholder', isShowingPlaceholder );
	}

	function getRawContent() {
		return editor.getContent( { format: 'raw' } ).trim();
	}

	function maybeRemovePlaceholder() {
		if ( hasContent( getRawContent() ) || editor.isHidden() ) {
			toggleShowingPlaceholder( false );
		}
	}

	function maybeAddPlaceholder() {
		if ( ! hasContent( getRawContent() ) && ! editor.isHidden() ) {
			toggleShowingPlaceholder( true );
		}
	}

	editor.on( 'init', () => {
		editor.dom.addStyle( `
			body.is-showing-placeholder:not( :focus )::before {
				content: '${ element.getAttribute( 'placeholder' ) }';
			}
		` );

		editor.on( 'show', maybeAddPlaceholder );
		editor.on( 'hide', maybeRemovePlaceholder );
		editor.dom.bind( editor.getBody(), 'focus', maybeRemovePlaceholder );
		editor.dom.bind( editor.getBody(), 'blur', maybeAddPlaceholder );

		if ( ! editor.isHidden() ) {
			maybeAddPlaceholder();
		}
	} );

	editor.on( 'SetContent', ( event ) => {
		toggleShowingPlaceholder( ! hasContent( event.content ) );
	} );
}

export default function() {
	tinymce.PluginManager.add( 'placeholder', placeholder );
}
