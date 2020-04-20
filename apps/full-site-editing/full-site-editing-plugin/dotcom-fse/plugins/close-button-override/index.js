/* global fullSiteEditing */

/**
 * External dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import domReady from '@wordpress/dom-ready';
import ReactDOM from 'react-dom';
import { __ } from '@wordpress/i18n';
import { Button, Dashicon } from '@wordpress/components';
import { useState } from '@wordpress/element';
/* eslint-disable import/no-extraneous-dependencies */

/**
 * Internal dependencies
 */
import './style.scss';

function BackButtonOverride( { defaultLabel, defaultUrl } ) {
	const [ label, updateLabel ] = useState( defaultLabel );
	const [ url, updateUrl ] = useState( defaultUrl );
	window.wp.hooks.addAction( 'updateCloseButtonOverrides', 'a8c-fse', ( data ) => {
		updateLabel( data.label );
		updateUrl( data.closeUrl );
	} );

	return (
		<a href={ url } aria-label={ label }>
			{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
			<Button className="components-button components-icon-button">
				<Dashicon icon="arrow-left-alt2" />
				<div className="close-button-override__label">{ label }</div>
			</Button>
		</a>
	);
}

domReady( () => {
	const { editorPostType } = fullSiteEditing;

	// Only alter for the page, post, and template part editors.
	if (
		'wp_template_part' !== editorPostType &&
		'page' !== editorPostType &&
		'post' !== editorPostType
	) {
		return;
	}

	const editPostHeaderInception = setInterval( () => {
		// Cycle through interval until header toolbar is found.
		const toolbar = document.querySelector( '.edit-post-header__toolbar' );

		if ( ! toolbar ) {
			return;
		}
		clearInterval( editPostHeaderInception );

		// Add components toolbar with override class name (original will be hidden in ./style.scss).
		const componentsToolbar = document.createElement( 'div' );
		componentsToolbar.className =
			'components-toolbar edit-post-fullscreen-mode-close__toolbar edit-post-fullscreen-mode-close__toolbar__override';
		toolbar.prepend( componentsToolbar );

		// These should go here so that they have any updates that happened while querying for the selector.
		let { closeButtonLabel, closeButtonUrl } = fullSiteEditing;

		/**
		 * We have to reference calypsoifyGutenberg off of the window object
		 * directly to handle the case where it is undefined. Otherwise, the
		 * variable declariation itself won't exist, causing a runtime error.
		 */
		const { calypsoifyGutenberg } = window;

		// Use wpcom close button/url if they exist.
		if ( calypsoifyGutenberg && calypsoifyGutenberg.closeUrl ) {
			closeButtonUrl = calypsoifyGutenberg.closeUrl;
		}

		if ( calypsoifyGutenberg && calypsoifyGutenberg.closeButtonLabel ) {
			closeButtonLabel = calypsoifyGutenberg.closeButtonLabel;
		}

		const defaultUrl = closeButtonUrl || `edit.php?post_type=${ editorPostType }`;

		let defaultLabel = closeButtonLabel || 'Back';
		if ( 'page' === editorPostType && ! closeButtonLabel ) {
			defaultLabel = __( 'Pages' );
		} else if ( 'post' === editorPostType && ! closeButtonLabel ) {
			defaultLabel = __( 'Posts' );
		} else if ( 'wp_template_part' === editorPostType && ! closeButtonLabel ) {
			defaultLabel = __( 'Template Parts' );
		}

		ReactDOM.render(
			<BackButtonOverride defaultLabel={ defaultLabel } defaultUrl={ defaultUrl } />,
			componentsToolbar
		);
	} );
} );
