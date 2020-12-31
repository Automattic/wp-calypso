/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { compose, useResizeObserver } from '@wordpress/compose';
import { ErrorBoundary } from '@wordpress/editor';
import { withDispatch, withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import ClickOutsideWrapper from './click-outside';
import BlockEditorContents from '../block-editor-contents';
import HotSwapper from './hot-swapper';
import './style.scss';

/** @typedef {import('../../index').BlockEditorSettings} BlockEditorSettings */
/** @typedef {import('../../index').OnSave} OnSave */
/** @typedef {import('../../index').OnError} OnError */
/** @typedef {import('../../index').OnMore} OnMore */
/** @typedef {import('../../store/editor/reducer').EditorMode} EditorMode */
/** @typedef {import('../../index').OnLoad} OnLoad */

/**
 * Set editing callback
 *
 * @callback OnSetEditing
 * @param {boolean} isEditing
 */

const SIZE_LARGE = 720;
const SIZE_MEDIUM = 480;

/**
 * Contains the block contents. Handles the hot-swapping of the redux stores, as well as applying the root CSS classes
 *
 * @param {object} props - Component props
 * @param {object} props.children - Child components
 * @param {boolean} props.isEditorReady - The editor is ready for editing
 * @param {boolean} props.isEditing - This editor is being edited in
 * @param {boolean} props.hasFixedToolbar - Has fixed toolbar
 * @param {EditorMode} props.editorMode - 'text' or 'visual'
 * @param {string} props.className - additional class names
 * @param {BlockEditorSettings} props.settings - Settings
 * @param {OnSave} props.onSave - Save callback
 * @param {OnError} props.onError - Error callback
 * @param {OnMore} props.renderMoreMenu - Callback to render additional items in the more menu
 * @param {OnSetEditing} props.setEditing - Set the mode to editing
 * @param {OnLoad} props.onLoad - Load initial blocks
 */
function BlockEditorContainer( props ) {
	const { children, settings, onSave, className, onError, renderMoreMenu, onLoad } = props;
	const { isEditorReady, editorMode, isEditing, setEditing, hasFixedToolbar } = props;
	const [ resizeListener, { width } ] = useResizeObserver();
	const classes = classnames( className, {
		'iso-editor': true,

		'is-large': width >= SIZE_LARGE,
		'is-medium': width >= SIZE_MEDIUM && width < SIZE_LARGE,
		'is-small': width < SIZE_MEDIUM,

		'iso-editor__loading': ! isEditorReady,
		'iso-editor__selected': isEditing,

		// Match Gutenberg
		'block-editor': true,
		'edit-post-layout': true,
		'has-fixed-toolbar': hasFixedToolbar,
		[ 'is-mode-' + editorMode ]: true,
	} );

	return (
		<div className={ classes }>
			<ErrorBoundary onError={ onError }>
				<HotSwapper />

				{ resizeListener }

				<ClickOutsideWrapper
					onOutside={ () => setEditing( false ) }
					onFocus={ () => ! isEditing && setEditing( true ) }
				>
					<BlockEditorContents
						onSave={ onSave }
						settings={ settings }
						renderMoreMenu={ renderMoreMenu }
						onLoad={ onLoad }
					>
						{ children }
					</BlockEditorContents>
				</ClickOutsideWrapper>
			</ErrorBoundary>
		</div>
	);
}

export default compose( [
	withSelect( ( select ) => {
		const { isEditorReady, getEditorMode, isEditing, isFeatureActive } = select(
			'isolated/editor'
		);

		return {
			isEditorReady: isEditorReady(),
			editorMode: getEditorMode(),
			isEditing: isEditing(),
			hasFixedToolbar: isFeatureActive( 'fixedToolbar' ),
		};
	} ),
	withDispatch( ( dispatch ) => {
		const { setEditing } = dispatch( 'isolated/editor' );

		return {
			setEditing,
		};
	} ),
] )( BlockEditorContainer );
