/** @typedef {import('../../index').EditorSettings} EditorSettings */
/** @typedef {import('../../index').IsoSettings} IsoSettings */

/**
 * Get all the allowed block types, either from the P2 settings, or all available blocks
 *
 * @param {{allowBlocks: string[]}} blockSettings - P2 settings for available blocks
 * @param {object[]} allBlockTypes - All available blocks
 * @returns {string[]}
 */
function getAllowedBlockTypes( blockSettings, allBlockTypes ) {
	if ( blockSettings && blockSettings.allowBlocks && blockSettings.allowBlocks.length > 0 ) {
		return blockSettings.allowBlocks;
	}

	// No allow blocks - return all blocks
	return allBlockTypes.map( ( block ) => block.name );
}

/**
 * Get all the disallowed block types, either from the P2 settings, or all available blocks
 *
 * @param {{disallowBlocks: string[]}} blockSettings - P2 settings for disallowed blocks
 * @returns {string[]}
 */
function getDisallowedBlocks( blockSettings ) {
	if ( blockSettings && blockSettings.disallowBlocks ) {
		return blockSettings.disallowBlocks;
	}

	// No blocks disallowed
	return [];
}

/**
 * Get editor settings
 *
 * @param {EditorSettings} editorSettings - Editor settings
 * @param {IsoSettings} isoSettings
 * @param {object[]} allBlockTypes - All available blocks
 * @param {boolean} hasFixedToolbar - Do we need a fixed toolbar?
 * @returns {EditorSettings}
 */
export default function getEditorSettings(
	editorSettings,
	isoSettings,
	allBlockTypes,
	hasFixedToolbar
) {
	const disallowBlocks = getDisallowedBlocks( isoSettings.blocks );

	return {
		...editorSettings,
		hasFixedToolbar,
		allowedBlockTypes: getAllowedBlockTypes( isoSettings.blocks, allBlockTypes ).filter(
			( blockName ) => disallowBlocks.indexOf( blockName ) === -1
		),

		// Enable or disable media uploads. We do this here as a logged out user doesn't have a user object, and so the standard Gutenberg `canUser` won't work
		mediaUpload: editorSettings.allowedMimeTypes.length === 0 ? null : editorSettings.mediaUpload,
	};
}
