/* eslint no-console: [ 'error', { allow: [ 'error' ] } ] */

/**
 * External dependencies
 */
import { get, set, isFunction, some } from 'lodash';

/**
 * WordPress dependencies
 */
import { applyFilters } from '@wordpress/hooks';
import { select, dispatch } from '@wordpress/data';
import deprecated from '@wordpress/deprecated';

/**
 * Internal dependencies
 */
import { isIconUnreadable, isValidIcon, normalizeIconObject } from './utils';

/**
 * Defined behavior of a block type.
 *
 * @typedef {WPBlockType}
 *
 * @property {string}                    name       Block's namespaced name.
 * @property {string}                    title      Human-readable label for a block.
 *                                                  Shown in the block inserter.
 * @property {string}                    category   Category classification of block,
 *                                                  impacting where block is shown in
 *                                                  inserter results.
 * @property {(Object|string|WPElement)} icon       Slug of the Dashicon to be shown
 *                                                  as the icon for the block in the
 *                                                  inserter, or element or an object describing the icon.
 * @property {?string[]}                 keywords   Additional keywords to produce
 *                                                  block as inserter search result.
 * @property {?Object}                   attributes Block attributes.
 * @property {Function}                  save       Serialize behavior of a block,
 *                                                  returning an element describing
 *                                                  structure of the block's post
 *                                                  content markup.
 * @property {WPComponent}               edit       Component rendering element to be
 *                                                  interacted with in an editor.
 */

/**
 * Constant mapping post formats to the expected default block.
 *
 * @type {Object}
 */
const POST_FORMAT_BLOCK_MAP = {
	audio: 'core/audio',
	gallery: 'core/gallery',
	image: 'core/image',
	quote: 'core/quote',
	video: 'core/video',
};

/**
 * Registers a new block provided a unique name and an object defining its
 * behavior. Once registered, the block is made available as an option to any
 * editor interface where blocks are implemented.
 *
 * @param {string} name     Block name.
 * @param {Object} settings Block settings.
 *
 * @return {?WPBlock} The block, if it has been successfully registered;
 *                     otherwise `undefined`.
 */
export function registerBlockType( name, settings ) {
	settings = {
		name,
		...get( window._wpBlocks, name ),
		...settings,
	};

	if ( typeof name !== 'string' ) {
		console.error(
			'Block names must be strings.'
		);
		return;
	}
	if ( ! /^[a-z][a-z0-9-]*\/[a-z][a-z0-9-]*$/.test( name ) ) {
		console.error(
			'Block names must contain a namespace prefix, include only lowercase alphanumeric characters or dashes, and start with a letter. Example: my-plugin/my-custom-block'
		);
		return;
	}
	if ( select( 'core/blocks' ).getBlockType( name ) ) {
		console.error(
			'Block "' + name + '" is already registered.'
		);
		return;
	}

	settings = applyFilters( 'blocks.registerBlockType', settings, name );

	if ( ! settings || ! isFunction( settings.save ) ) {
		console.error(
			'The "save" property must be specified and must be a valid function.'
		);
		return;
	}
	if ( 'edit' in settings && ! isFunction( settings.edit ) ) {
		console.error(
			'The "edit" property must be a valid function.'
		);
		return;
	}
	if ( 'keywords' in settings && settings.keywords.length > 3 ) {
		console.error(
			'The block "' + name + '" can have a maximum of 3 keywords.'
		);
		return;
	}
	if ( ! ( 'category' in settings ) ) {
		console.error(
			'The block "' + name + '" must have a category.'
		);
		return;
	}
	if (
		'category' in settings &&
		! some( select( 'core/blocks' ).getCategories(), { slug: settings.category } )
	) {
		console.error(
			'The block "' + name + '" must have a registered category.'
		);
		return;
	}
	if ( ! ( 'title' in settings ) || settings.title === '' ) {
		console.error(
			'The block "' + name + '" must have a title.'
		);
		return;
	}
	if ( typeof settings.title !== 'string' ) {
		console.error(
			'Block titles must be strings.'
		);
		return;
	}

	settings.icon = normalizeIconObject( settings.icon );
	if ( ! isValidIcon( settings.icon.src ) ) {
		console.error(
			'The icon passed is invalid. ' +
			'The icon should be a string, an element, a function, or an object following the specifications documented in https://wordpress.org/gutenberg/handbook/block-api/#icon-optional'
		);
		return;
	}

	if ( isIconUnreadable( settings.icon ) && window ) {
		window.console.warn(
			`The icon background color ${ settings.icon.background } and the foreground color ${ settings.icon.foreground } are not readable together. ` +
			'Please try to increase the brightness and/or contrast difference between background and foreground.'
		);
	}

	if ( 'useOnce' in settings ) {
		deprecated( 'useOnce', {
			version: '3.3',
			alternative: 'supports.multiple',
			plugin: 'Gutenberg',
			hint: 'useOnce property in the settings param passed to wp.block.registerBlockType.',
		} );
		set( settings, [ 'supports', 'multiple' ], ! settings.useOnce );
	}

	dispatch( 'core/blocks' ).addBlockTypes( settings );

	return settings;
}

/**
 * Unregisters a block.
 *
 * @param {string} name Block name.
 *
 * @return {?WPBlock} The previous block value, if it has been successfully
 *                     unregistered; otherwise `undefined`.
 */
export function unregisterBlockType( name ) {
	const oldBlock = select( 'core/blocks' ).getBlockType( name );
	if ( ! oldBlock ) {
		console.error(
			'Block "' + name + '" is not registered.'
		);
		return;
	}
	dispatch( 'core/blocks' ).removeBlockTypes( name );
	return oldBlock;
}

/**
 * Assigns name of block handling unknown block types.
 *
 * @param {string} name Block name.
 */
export function setUnknownTypeHandlerName( name ) {
	dispatch( 'core/blocks' ).setFallbackBlockName( name );
}

/**
 * Retrieves name of block handling unknown block types, or undefined if no
 * handler has been defined.
 *
 * @return {?string} Blog name.
 */
export function getUnknownTypeHandlerName() {
	return select( 'core/blocks' ).getFallbackBlockName();
}

/**
 * Assigns the default block name.
 *
 * @param {string} name Block name.
 */
export function setDefaultBlockName( name ) {
	dispatch( 'core/blocks' ).setDefaultBlockName( name );
}

/**
 * Retrieves the default block name.
 *
 * @return {?string} Block name.
 */
export function getDefaultBlockName() {
	return select( 'core/blocks' ).getDefaultBlockName();
}

/**
 * Retrieves the expected default block for the post format.
 *
 * @param	{string} postFormat Post format
 * @return {string}            Block name.
 */
export function getDefaultBlockForPostFormat( postFormat ) {
	const blockName = POST_FORMAT_BLOCK_MAP[ postFormat ];
	if ( blockName && getBlockType( blockName ) ) {
		return blockName;
	}
	return null;
}

/**
 * Returns a registered block type.
 *
 * @param {string} name Block name.
 *
 * @return {?Object} Block type.
 */
export function getBlockType( name ) {
	return select( 'core/blocks' ).getBlockType( name );
}

/**
 * Returns all registered blocks.
 *
 * @return {Array} Block settings.
 */
export function getBlockTypes() {
	return select( 'core/blocks' ).getBlockTypes();
}

/**
 * Returns the block support value for a feature, if defined.
 *
 * @param  {(string|Object)} nameOrType      Block name or type object
 * @param  {string}          feature         Feature to retrieve
 * @param  {*}               defaultSupports Default value to return if not
 *                                           explicitly defined
 * @return {?*}                              Block support value
 */
export function getBlockSupport( nameOrType, feature, defaultSupports ) {
	const blockType = 'string' === typeof nameOrType ?
		getBlockType( nameOrType ) :
		nameOrType;

	return get( blockType, [
		'supports',
		feature,
	], defaultSupports );
}

/**
 * Returns true if the block defines support for a feature, or false otherwise.
 *
 * @param {(string|Object)} nameOrType      Block name or type object.
 * @param {string}          feature         Feature to test.
 * @param {boolean}         defaultSupports Whether feature is supported by
 *                                          default if not explicitly defined.
 *
 * @return {boolean} Whether block supports feature.
 */
export function hasBlockSupport( nameOrType, feature, defaultSupports ) {
	return !! getBlockSupport( nameOrType, feature, defaultSupports );
}

/**
 * Determines whether or not the given block is a shared block. This is a
 * special block type that is used to point to a global block stored via the
 * API.
 *
 * @param {Object} blockOrType Block or Block Type to test.
 *
 * @return {boolean} Whether the given block is a shared block.
 */
export function isSharedBlock( blockOrType ) {
	return blockOrType.name === 'core/block';
}

/**
 * Returns an array with the child blocks of a given block.
 *
 * @param {string} blockName Block type name.
 *
 * @return {Array} Array of child block names.
 */
export const getChildBlockNames = ( blockName ) => {
	return select( 'core/blocks' ).getChildBlockNames( blockName );
};

/**
 * Returns a boolean indicating if a block has child blocks or not.
 *
 * @param {string} blockName Block type name.
 *
 * @return {boolean} True if a block contains child blocks and false otherwise.
 */
export const hasChildBlocks = ( blockName ) => {
	return select( 'core/blocks' ).hasChildBlocks( blockName );
};
