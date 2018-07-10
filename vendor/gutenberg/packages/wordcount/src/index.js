import { extend, flow } from 'lodash';
import { defaultSettings } from './defaultSettings';
import stripTags from './stripTags';
import transposeAstralsToCountableChar from './transposeAstralsToCountableChar';
import stripHTMLEntities from './stripHTMLEntities';
import stripConnectors from './stripConnectors';
import stripRemovables from './stripRemovables';
import stripHTMLComments from './stripHTMLComments';
import stripShortcodes from './stripShortcodes';
import stripSpaces from './stripSpaces';
import transposeHTMLEntitiesToCountableChars from './transposeHTMLEntitiesToCountableChars';

/**
 * Private function to manage the settings.
 *
 * @param {string} type         The type of count to be done.
 * @param {Object} userSettings Custom settings for the count.
 *
 * @return {void|Object|*} The combined settings object to be used.
 */
function loadSettings( type, userSettings ) {
	const settings = extend( defaultSettings, userSettings );

	settings.shortcodes = settings.l10n.shortcodes || {};

	if ( settings.shortcodes && settings.shortcodes.length ) {
		settings.shortcodesRegExp = new RegExp( '\\[\\/?(?:' + settings.shortcodes.join( '|' ) + ')[^\\]]*?\\]', 'g' );
	}

	settings.type = type || settings.l10n.type;

	if ( settings.type !== 'characters_excluding_spaces' && settings.type !== 'characters_including_spaces' ) {
		settings.type = 'words';
	}

	return settings;
}

/**
 * Match the regex for the type 'words'
 *
 * @param {string} text     The text being processed
 * @param {string} regex    The regular expression pattern being matched
 * @param {Object} settings Settings object containing regular expressions for each strip function
 *
 * @return {Array|{index: number, input: string}} The matched string.
 */
function matchWords( text, regex, settings ) {
	text = flow(
		stripTags.bind( this, settings ),
		stripHTMLComments.bind( this, settings ),
		stripShortcodes.bind( this, settings ),
		stripSpaces.bind( this, settings ),
		stripHTMLEntities.bind( this, settings ),
		stripConnectors.bind( this, settings ),
		stripRemovables.bind( this, settings ),
	)( text );
	text = text + '\n';
	return text.match( regex );
}

/**
 * Match the regex for either 'characters_excluding_spaces' or 'characters_including_spaces'
 *
 * @param {string} text     The text being processed
 * @param {string} regex    The regular expression pattern being matched
 * @param {Object} settings Settings object containing regular expressions for each strip function
 *
 * @return {Array|{index: number, input: string}} The matched string.
 */
function matchCharacters( text, regex, settings ) {
	text = flow(
		stripTags.bind( this, settings ),
		stripHTMLComments.bind( this, settings ),
		stripShortcodes.bind( this, settings ),
		stripSpaces.bind( this, settings ),
		transposeAstralsToCountableChar.bind( this, settings ),
		transposeHTMLEntitiesToCountableChars.bind( this, settings ),
	)( text );
	text = text + '\n';
	return text.match( regex );
}

/**
 * Count some words.
 *
 * @param {String} text         The text being processed
 * @param {String} type         The type of count. Accepts ;words', 'characters_excluding_spaces', or 'characters_including_spaces'.
 * @param {Object} userSettings Custom settings object.
 *
 * @return {Number} The word or character count.
 */

export function count( text, type, userSettings ) {
	const settings = loadSettings( type, userSettings );
	if ( text ) {
		const matchRegExp = settings[ type + 'RegExp' ];
		const results = ( 'words' === settings.type ) ?
			matchWords( text, matchRegExp, settings ) :
			matchCharacters( text, matchRegExp, settings );

		return results ? results.length : 0;
	}
}
