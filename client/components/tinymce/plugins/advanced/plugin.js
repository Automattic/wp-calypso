/**
 * External dependencies
 */
var tinymce = require( 'tinymce/tinymce' ),
	throttle = require( 'lodash/throttle' );

/**
 * Internal dependencies
 */
var PreferencesStore = require( 'lib/preferences/store' ),
	PreferencesActions = require( 'lib/preferences/actions' ),
	isWithinBreakpoint = require( 'lib/viewport' ).isWithinBreakpoint;

function advanced( editor ) {
	var button, updateVisibleState;

	function isAdvancedVisible() {
		return !! PreferencesStore.get( 'editorAdvancedVisible' );
	}

	function toggleAdvancedVisible() {
		PreferencesActions.set( 'editorAdvancedVisible', ! isAdvancedVisible() );
	}

	updateVisibleState = throttle( function() {
		var toolbars = editor.theme.panel.find( '.toolbar:not(.menubar)' ),
			isSmallViewport = isWithinBreakpoint( '<960px' ),
			containerPadding = 0;

		toolbars.each( function( toolbar, i ) {
			var isToolbarVisible = isSmallViewport || i === 0 || isAdvancedVisible();

			toolbar.visible( isToolbarVisible );

			if ( isAdvancedVisible ) {
				if ( isSmallViewport ) {
					containerPadding = Math.max( containerPadding, toolbar.getEl().clientHeight );
				} else {
					containerPadding += toolbar.getEl().clientHeight;
				}
			}
		} );

		tinymce.DOM.setStyles( editor.getContainer(), {
			'padding-top': containerPadding
		} );

		if ( button ) {
			button.active( isAdvancedVisible() );
		}
	}, 500 );

	editor.addButton( 'wpcom_advanced', {
		text: 'Toggle Advanced',
		tooltip: 'Toggle Advanced',
		classes: 'btn advanced',
		cmd: 'WPCOM_ToggleAdvancedVisible',
		onPostRender: function() {
			button = this;
		}
	} );

	editor.addCommand( 'WPCOM_ToggleAdvancedVisible', toggleAdvancedVisible );

	editor.on( 'init', function() {
		PreferencesActions.fetch();
	} );

	editor.on( 'preInit', function() {
		editor.shortcuts.add( 'access+z', '', 'WPCOM_ToggleAdvancedVisible' );
	} );

	editor.on( 'init show', updateVisibleState );

	window.addEventListener( 'resize', updateVisibleState );

	PreferencesStore.on( 'change', function() {
		updateVisibleState();
	} );
}

module.exports = function() {
	tinymce.PluginManager.add( 'wpcom/advanced', advanced );
};
