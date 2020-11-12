/** @typedef {import('../../index').IsoSettings} IsoSettings */
/** @typedef {import('./reducer').EditorMode} EditorMode */
/** @typedef {import('./reducer').Pattern} Pattern */
/** @typedef {import('./reducer').EditorState} EditorState */

/**
 * Get current editor mode
 * @param {{editor: EditorState}} state - Current state
 * @returns {EditorMode}
 */
export function getEditorMode( state ) {
	return state.editor.editorMode;
}

/**
 * Get current editor settings
 * @param {{editor: EditorState}} state - Current state
 * @returns {IsoSettings}
 */
export function getEditorSettings( state ) {
	return state.editor.settings;
}

/**
 * Is the editor ready for use?
 * @param {{editor: EditorState}} state - Current state
 * @returns {boolean}
 */
export function isEditorReady( state ) {
	return state.editor.isReady;
}

/**
 * Get current pattern name
 * @param {{editor: EditorState}} state - Current state
 * @returns {string}
 */
export function getCurrentPatternName( state ) {
	return state.editor.currentPattern;
}

/**
 * Get current pattern
 * @param {{editor: EditorState}} state - Current state
 * @returns {Pattern}
 */
export function getCurrentPattern( state ) {
	const { currentPattern, patterns } = state.editor;

	if ( currentPattern && patterns ) {
		for ( let index = 0; index < patterns.length; index++ ) {
			if ( patterns[ index ][ 'name' ] === currentPattern ) {
				return patterns[ index ];
			}
		}
	}

	return null;
}

/**
 * Get all ignored content
 * @param {{editor: EditorState}} state - Current state
 * @returns {string[]}
 */
export function getIgnoredContent( state ) {
	return state.editor.ignoredContent;
}

/**
 * Get the pattern for a given name
 * @param {{editor: EditorState}} state - Current state
 * @returns {Pattern}
 */
export function getNamedPattern( state, patternName ) {
	const { patterns = [] } = state.editor;
	let pattern = patterns.find( ( item ) => item.name === patternName );

	// Find the full name
	if ( pattern ) {
		return pattern;
	}

	// Find the shortened name
	pattern = patterns.find( ( item ) => item.name.replace( 'p2/', '' ) === patternName );
	if ( pattern ) {
		return pattern;
	}

	return null;
}

/**
 * Is the block inserter open?
 * @param {{editor: EditorState}} state - Current state
 * @returns {boolean}
 */
export function isInserterOpened( state ) {
	return state.editor.isInserterOpened;
}

/**
 * Is the block inspector open?
 * @param {{editor: EditorState}} state - Current state
 * @returns {boolean}
 */
export function isInspecting( state ) {
	return state.editor.isInspecting;
}

/**
 * Are we editing this editor?
 * @param {{editor: EditorState}} state - Current state
 * @returns {boolean}
 */
export function isEditing( state ) {
	return state.editor.isEditing;
}

/**
 * Get all patterns
 * @param {{editor: EditorState}} state - Current state
 * @returns {Pattern[]}
 */
export function getPatterns( state ) {
	return state.editor.patterns;
}
