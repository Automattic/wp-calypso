/**
 * External dependencies
 */
import React from 'react';
import ReactDomServer from 'react-dom/server';
import tinymce from 'tinymce/tinymce';
import throttle from 'lodash/throttle';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { isWithinBreakpoint } from 'lib/viewport';
import Gridicon from 'components/gridicon';
import { savePreference, fetchPreferences } from 'state/preferences/actions';
import { getPreference, isFetchingPreferences } from 'state/preferences/selectors';

function advanced( editor ) {
	const store = editor.getParam( 'redux_store' );
	if ( ! store ) {
		return;
	}

	const { dispatch, getState, subscribe } = store;

	function getVisibleState() {
		return getPreference( getState(), 'editorAdvancedVisible' );
	}

	let isAdvancedVisible = getVisibleState();
	let menuButton;

	const updateVisibleState = throttle( function() {
		var toolbars = editor.theme.panel.find( '.toolbar:not(.menubar)' ),
			isSmallViewport = isWithinBreakpoint( '<960px' ),
			containerPadding = 0;

		toolbars.each( function( toolbar, i ) {
			var isToolbarVisible = isSmallViewport || i === 0 || isAdvancedVisible;

			toolbar.visible( isToolbarVisible );

			if ( isToolbarVisible ) {
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
			menuButton.active( isAdvancedVisible );
		}
	}, 500 );

	editor.addButton( 'wpcom_advanced', {
		text: translate( 'Toggle Advanced' ),
		tooltip: translate( 'Toggle Advanced' ),
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

	editor.addCommand( 'WPCOM_ToggleAdvancedVisible', () => {
		dispatch( savePreference( 'editorAdvancedVisible', ! isAdvancedVisible ) );
	} );

	editor.on( 'init', function() {
		if ( ! isFetchingPreferences( getState() ) ) {
			dispatch( fetchPreferences() );
		}
	} );

	editor.on( 'preInit', function() {
		editor.shortcuts.add( 'access+z', '', 'WPCOM_ToggleAdvancedVisible' );
	} );

	editor.on( 'init show', updateVisibleState );

	window.addEventListener( 'resize', updateVisibleState );

	subscribe( () => {
		const nextVisible = getVisibleState();
		if ( nextVisible === isAdvancedVisible ) {
			return;
		}

		isAdvancedVisible = nextVisible;
		updateVisibleState();
	} );
}

module.exports = function() {
	tinymce.PluginManager.add( 'wpcom/advanced', advanced );
};
