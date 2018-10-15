/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { render, unmountComponentAtNode } from '@wordpress/element';
import { dispatch } from '@wordpress/data';
import deprecated from '@wordpress/deprecated';

/**
 * Internal dependencies
 */
import './hooks';
import Editor from './editor';

import 'gutenberg/extensions/presets/jetpack';

/**
 * Reinitializes the editor after the user chooses to reboot the editor after
 * an unhandled error occurs, replacing previously mounted editor element using
 * an initial state from prior to the crash.
 *
 * @param {Object}  postType       Post type of the post to edit.
 * @param {Object}  postId         ID of the post to edit.
 * @param {Element} target         DOM node in which editor is rendered.
 * @param {?Object} settings       Editor settings object.
 * @param {Object}  overridePost   Post properties to override.
 */
export function reinitializeEditor( postType, postId, target, settings, overridePost ) {
	unmountComponentAtNode( target );
	const reboot = reinitializeEditor.bind( null, postType, postId, target, settings, overridePost );

	render(
		<Editor settings={ settings } onError={ reboot } postId={ postId } postType={ postType } overridePost={ overridePost } recovery />,
		target
	);
}

/**
 * Initializes and returns an instance of Editor.
 *
 * @param {string}  id            Unique identifier for editor instance.
 * @param {Object}  postType      Post type of the post to edit.
 * @param {Object}  postId        ID of the post to edit.
 * @param {?Object} settings      Editor settings object.
 * @param {Object}  overridePost  Post properties to override.
 *
 * @return {Object} Editor interface.
 */
export function initializeEditor( id, postType, postId, settings, overridePost ) {
	const target = document.getElementById( id );
	const reboot = reinitializeEditor.bind( null, postType, postId, target, settings, overridePost );

	// Global deprecations which cannot otherwise be injected into known usage.
	deprecated( 'paragraphs block class set is-small-text, ..., is-large-text', {
		version: '3.6',
		alternative: 'has-small-font-size, ..., has-large-font-size class set',
		plugin: 'Gutenberg',
		hint: 'If paragraphs using this classes are opened in the editor new classes are automatically applied the post just needs to be saved. This is a global warning, shown regardless of whether the classes are used in the current post.',
	} );

	dispatch( 'core/nux' ).triggerGuide( [
		'core/editor.inserter',
		'core/editor.settings',
		'core/editor.preview',
		'core/editor.publish',
	] );

	render(
		<Editor settings={ settings } onError={ reboot } postId={ postId } postType={ postType } overridePost={ overridePost } />,
		target
	);
}

export { default as PluginBlockSettingsMenuItem } from './components/block-settings-menu/plugin-block-settings-menu-item';
export { default as PluginPostPublishPanel } from './components/sidebar/plugin-post-publish-panel';
export { default as PluginPostStatusInfo } from './components/sidebar/plugin-post-status-info';
export { default as PluginPrePublishPanel } from './components/sidebar/plugin-pre-publish-panel';
export { default as PluginSidebar } from './components/sidebar/plugin-sidebar';
export { default as PluginSidebarMoreMenuItem } from './components/header/plugin-sidebar-more-menu-item';
