/**
 * External dependencies
 */
import React from 'react';
import ReactDomServer from 'react-dom/server';
import tinymce from 'tinymce/tinymce';
import throttle from 'lodash/throttle';

/**
 * Internal dependencies
 */
import PreferencesStore from 'lib/preferences/store';
import PreferencesActions from 'lib/preferences/actions';
import { isWithinBreakpoint } from 'lib/viewport';
import Gridicon from 'components/gridicon';

function advanced( editor ) {
	let menuButton, updateVisibleState;

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

		if ( menuButton ) {
			menuButton.active( isAdvancedVisible() );
		}
	}, 500 );

	editor.addButton( 'wpcom_advanced', {
		text: 'Toggle Advanced',
		tooltip: 'Toggle Advanced',
		classes: 'btn wpcom-icon-button advanced',
		cmd: 'WPCOM_ToggleAdvancedVisible',
		onPostRender: function() {
			// Save a reference to the menu button after render so the
			// visibility update handler can change its active state.
			menuButton = this;

			this.innerHtml( ReactDomServer.renderToStaticMarkup(
				<button type="button" role="presentation" tabIndex="-1">
					{ /* eslint-disable wpcalypso/jsx-gridicon-size */ }
					<Gridicon icon="ellipsis" size={ 28 } />
					{ /* eslint-enable wpcalypso/jsx-gridicon-size */ }
				</button>
			) );
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
