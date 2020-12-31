/** @typedef {import('../../index').BlockEditorSettings} BlockEditorSettings */
/** @typedef {import('./reducer').EditorMode} EditorMode */

const actions = {
	/**
	 * Set whether the editor is ready for editing
	 *
	 * @param {boolean} isReady - Whether editor is ready
	 */
	setReady( isReady ) {
		return {
			type: 'SET_EDITOR_READY',
			isReady,
		};
	},
	/**
	 * Set the current editor mode
	 *
	 * @param {EditorMode} editorMode Editor mode
	 */
	setEditorMode( editorMode ) {
		return {
			type: 'SET_EDITOR_MODE',
			editorMode,
		};
	},
	/**
	 * Set up the editor
	 *
	 * @param {BlockEditorSettings} settings - Settings
	 */
	setupEditor( settings ) {
		return {
			type: 'SETUP_EDITOR',
			settings,
		};
	},
	/**
	 * Set the current pattern name
	 *
	 * @param {string} pattern Pattern name
	 */
	setCurrentPattern( pattern ) {
		return {
			type: 'SET_CURRENT_PATTERN',
			pattern,
		};
	},
	/**
	 * Mark the block inserter as open or closed
	 *
	 * @param {boolean} isOpen - Whether block inserter is open
	 */
	setIsInserterOpened( isOpen ) {
		return {
			type: 'SET_INSERTER_OPEN',
			isOpen,
		};
	},
	/**
	 * Mark this editor as in-use or not
	 *
	 * @param {boolean} isEditing - Whether editor is being used
	 */
	setEditing( isEditing ) {
		return {
			type: 'SET_EDITING',
			isEditing,
		};
	},
	/**
	 * Mark the block inserter as open or closed
	 *
	 * @param {boolean} isOpen - Whether the inspector is open
	 */
	setInspecting( isOpen ) {
		return {
			type: 'SET_INSPECTOR_OPEN',
			isOpen,
		};
	},
};

export default actions;
