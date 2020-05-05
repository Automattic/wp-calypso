/**
 * External dependencies
 */
import { isWithinBreakpoint } from '@automattic/viewport';
import React from 'react';
import ReactDomServer from 'react-dom/server';
import tinymce from 'tinymce/tinymce';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { savePreference, fetchPreferences } from 'state/preferences/actions';
import { getPreference, isFetchingPreferences } from 'state/preferences/selectors';
import Gridicon from 'components/gridicon';

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

	function updateVisibleState() {
		const toolbars = editor.theme.panel.find( '.toolbar:not(.menubar)' );
		const isSmallViewport = isWithinBreakpoint( '<960px' );
		let containerPadding = 0;

		toolbars.each( function ( toolbar, i ) {
			const isToolbarVisible = isSmallViewport || i === 0 || isAdvancedVisible;

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
			'padding-top': containerPadding,
		} );

		if ( menuButton ) {
			menuButton.active( isAdvancedVisible );
		}
	}

	editor.addButton( 'wpcom_advanced', {
		text: translate( 'Toggle Advanced' ),
		tooltip: translate( 'Toggle Advanced' ),
		classes: 'btn wpcom-icon-button advanced',
		cmd: 'WPCOM_ToggleAdvancedVisible',
		onPostRender: function () {
			// Save a reference to the menu button after render so the
			// visibility update handler can change its active state.
			menuButton = this;

			this.innerHtml(
				ReactDomServer.renderToStaticMarkup(
					// eslint-disable-next-line jsx-a11y/no-interactive-element-to-noninteractive-role
					<button type="button" role="presentation" tabIndex="-1">
						{ /* eslint-disable wpcalypso/jsx-gridicon-size */ }
						<Gridicon icon="ellipsis" size={ 28 } />
						{ /* eslint-enable wpcalypso/jsx-gridicon-size */ }
					</button>
				)
			);
		},
	} );

	editor.addCommand( 'WPCOM_ToggleAdvancedVisible', () => {
		dispatch( savePreference( 'editorAdvancedVisible', ! isAdvancedVisible ) );
	} );

	editor.on( 'init', function () {
		if ( ! isFetchingPreferences( getState() ) ) {
			dispatch( fetchPreferences() );
		}
	} );

	editor.on( 'preInit', function () {
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

export default function () {
	tinymce.PluginManager.add( 'wpcom/advanced', advanced );
}
