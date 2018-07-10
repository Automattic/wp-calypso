/**
 * External dependencies
 */
import { parse as hpqParse } from 'hpq';
import { flow, castArray, mapValues, omit, stubFalse } from 'lodash';

/**
 * WordPress dependencies
 */
import { autop } from '@wordpress/autop';
import { applyFilters } from '@wordpress/hooks';
import deprecated from '@wordpress/deprecated';

/**
 * Internal dependencies
 */
import { parse as grammarParse } from './post-parser';
import { getBlockType, getUnknownTypeHandlerName } from './registration';
import { createBlock } from './factory';
import { isValidBlock } from './validation';
import { getCommentDelimitedContent } from './serializer';
import { attr, prop, html, text, query, node, children } from './matchers';

/**
 * Higher-order hpq matcher which enhances an attribute matcher to return true
 * or false depending on whether the original matcher returns undefined. This
 * is useful for boolean attributes (e.g. disabled) whose attribute values may
 * be technically falsey (empty string), though their mere presence should be
 * enough to infer as true.
 *
 * @param {Function} matcher Original hpq matcher.
 *
 * @return {Function} Enhanced hpq matcher.
 */
export const toBooleanAttributeMatcher = ( matcher ) => flow( [
	matcher,
	// Expected values from `attr( 'disabled' )`:
	//
	// <input>
	// - Value:       `undefined`
	// - Transformed: `false`
	//
	// <input disabled>
	// - Value:       `''`
	// - Transformed: `true`
	//
	// <input disabled="disabled">
	// - Value:       `'disabled'`
	// - Transformed: `true`
	( value ) => value !== undefined,
] );

/**
 * Returns value coerced to the specified JSON schema type string.
 *
 * @see http://json-schema.org/latest/json-schema-validation.html#rfc.section.6.25
 *
 * @param {*}      value Original value.
 * @param {string} type  Type to coerce.
 *
 * @return {*} Coerced value.
 */
export function asType( value, type ) {
	switch ( type ) {
		case 'string':
			return String( value );

		case 'boolean':
			return Boolean( value );

		case 'object':
			return Object( value );

		case 'null':
			return null;

		case 'array':
			if ( Array.isArray( value ) ) {
				return value;
			}

			return Array.from( value );

		case 'integer':
		case 'number':
			return Number( value );
	}

	return value;
}

/**
 * Returns an hpq matcher given a source object.
 *
 * @param {Object} sourceConfig Attribute Source object.
 *
 * @return {Function} A hpq Matcher.
 */
export function matcherFromSource( sourceConfig ) {
	switch ( sourceConfig.source ) {
		case 'attribute':
			let matcher = attr( sourceConfig.selector, sourceConfig.attribute );
			if ( sourceConfig.type === 'boolean' ) {
				matcher = toBooleanAttributeMatcher( matcher );
			}

			return matcher;
		case 'property':
			deprecated( '`property` source', {
				version: '3.4',
				alternative: 'equivalent `text`, `html`, or `attribute` source, or comment attribute',
				plugin: 'Gutenberg',
			} );

			return prop( sourceConfig.selector, sourceConfig.property );
		case 'html':
			return html( sourceConfig.selector );
		case 'text':
			return text( sourceConfig.selector );
		case 'children':
			return children( sourceConfig.selector );
		case 'node':
			return node( sourceConfig.selector );
		case 'query':
			const subMatchers = mapValues( sourceConfig.query, matcherFromSource );
			return query( sourceConfig.selector, subMatchers );
		default:
			// eslint-disable-next-line no-console
			console.error( `Unknown source type "${ sourceConfig.source }"` );
	}
}

/**
 * Given a block's raw content and an attribute's schema returns the attribute's
 * value depending on its source.
 *
 * @param {string} innerHTML         Block's raw content.
 * @param {Object} attributeSchema   Attribute's schema.
 *
 * @return {*} Attribute value.
 */
export function parseWithAttributeSchema( innerHTML, attributeSchema ) {
	return hpqParse( innerHTML, matcherFromSource( attributeSchema ) );
}

/**
 * Given an attribute key, an attribute's schema, a block's raw content and the
 * commentAttributes returns the attribute value depending on its source
 * definition of the given attribute key.
 *
 * @param {string} attributeKey      Attribute key.
 * @param {Object} attributeSchema   Attribute's schema.
 * @param {string} innerHTML         Block's raw content.
 * @param {Object} commentAttributes Block's comment attributes.
 *
 * @return {*} Attribute value.
 */
export function getBlockAttribute( attributeKey, attributeSchema, innerHTML, commentAttributes ) {
	let value;
	switch ( attributeSchema.source ) {
		// undefined source means that it's an attribute serialized to the block's "comment"
		case undefined:
			value = commentAttributes ? commentAttributes[ attributeKey ] : undefined;
			break;
		case 'attribute':
		case 'property':
		case 'html':
		case 'text':
		case 'children':
		case 'node':
		case 'query':
			value = parseWithAttributeSchema( innerHTML, attributeSchema );
			break;
	}

	return value === undefined ? attributeSchema.default : asType( value, attributeSchema.type );
}

/**
 * Returns the block attributes of a registered block node given its type.
 *
 * @param {?Object} blockType  Block type.
 * @param {string}  innerHTML  Raw block content.
 * @param {?Object} attributes Known block attributes (from delimiters).
 *
 * @return {Object} All block attributes.
 */
export function getBlockAttributes( blockType, innerHTML, attributes ) {
	const blockAttributes = mapValues( blockType.attributes, ( attributeSchema, attributeKey ) => {
		return getBlockAttribute( attributeKey, attributeSchema, innerHTML, attributes );
	} );

	return applyFilters(
		'blocks.getBlockAttributes',
		blockAttributes,
		blockType,
		innerHTML,
		attributes
	);
}

/**
 * Given a block object, returns a new copy of the block with any applicable
 * deprecated migrations applied, or the original block if it was both valid
 * and no eligible migrations exist.
 *
 * @param {WPBlock} block Original block object.
 *
 * @return {WPBlock} Migrated block object.
 */
export function getMigratedBlock( block ) {
	const blockType = getBlockType( block.name );

	const { deprecated: deprecatedDefinitions } = blockType;
	if ( ! deprecatedDefinitions || ! deprecatedDefinitions.length ) {
		return block;
	}

	const { originalContent, attributes, innerBlocks } = block;

	for ( let i = 0; i < deprecatedDefinitions.length; i++ ) {
		// A block can opt into a migration even if the block is valid by
		// defining isEligible on its deprecation. If the block is both valid
		// and does not opt to migrate, skip.
		const { isEligible = stubFalse } = deprecatedDefinitions[ i ];
		if ( block.isValid && ! isEligible( attributes, innerBlocks ) ) {
			continue;
		}

		// Block type properties which could impact either serialization or
		// parsing are not considered in the deprecated block type by default,
		// and must be explicitly provided.
		const deprecatedBlockType = Object.assign(
			omit( blockType, [ 'attributes', 'save', 'supports' ] ),
			deprecatedDefinitions[ i ]
		);

		let migratedAttributes = getBlockAttributes(
			deprecatedBlockType,
			originalContent,
			attributes
		);

		// Ignore the deprecation if it produces a block which is not valid.
		const isValid = isValidBlock(
			originalContent,
			deprecatedBlockType,
			migratedAttributes
		);

		if ( ! isValid ) {
			continue;
		}

		block = {
			...block,
			isValid: true,
		};

		let migratedInnerBlocks = innerBlocks;

		// A block may provide custom behavior to assign new attributes and/or
		// inner blocks.
		const { migrate } = deprecatedBlockType;
		if ( migrate ) {
			( [
				migratedAttributes = attributes,
				migratedInnerBlocks = innerBlocks,
			] = castArray( migrate( migratedAttributes, innerBlocks ) ) );
		}

		block.attributes = migratedAttributes;
		block.innerBlocks = migratedInnerBlocks;
	}

	return block;
}

/**
 * Creates a block with fallback to the unknown type handler.
 *
 * @param {Object} blockNode Parsed block node.
 *
 * @return {?Object} An initialized block object (if possible).
 */
export function createBlockWithFallback( blockNode ) {
	let {
		blockName: name,
		attrs: attributes,
		innerBlocks = [],
		innerHTML,
	} = blockNode;

	attributes = attributes || {};

	// Trim content to avoid creation of intermediary freeform segments.
	innerHTML = innerHTML.trim();

	// Use type from block content, otherwise find unknown handler.
	name = name || getUnknownTypeHandlerName();

	// Convert 'core/text' blocks in existing content to 'core/paragraph'.
	if ( 'core/text' === name || 'core/cover-text' === name ) {
		name = 'core/paragraph';
	}

	// Try finding the type for known block name, else fall back again.
	let blockType = getBlockType( name );

	const fallbackBlock = getUnknownTypeHandlerName();

	// Fallback content may be upgraded from classic editor expecting implicit
	// automatic paragraphs, so preserve them. Assumes wpautop is idempotent,
	// meaning there are no negative consequences to repeated autop calls.
	if ( name === fallbackBlock ) {
		innerHTML = autop( innerHTML ).trim();
	}

	if ( ! blockType ) {
		// If detected as a block which is not registered, preserve comment
		// delimiters in content of unknown type handler.
		if ( name ) {
			innerHTML = getCommentDelimitedContent( name, attributes, innerHTML );
		}

		name = fallbackBlock;
		blockType = getBlockType( name );
	}

	// Coerce inner blocks from parsed form to canonical form.
	innerBlocks = innerBlocks.map( createBlockWithFallback );

	// Include in set only if type were determined.
	if ( ! blockType || ( ! innerHTML && name === fallbackBlock ) ) {
		return;
	}

	let block = createBlock(
		name,
		getBlockAttributes( blockType, innerHTML, attributes ),
		innerBlocks
	);

	// Block validation assumes an idempotent operation from source block to serialized block
	// provided there are no changes in attributes. The validation procedure thus compares the
	// provided source value with the serialized output before there are any modifications to
	// the block. When both match, the block is marked as valid.
	if ( name !== fallbackBlock ) {
		block.isValid = isValidBlock( innerHTML, blockType, block.attributes );
	}

	// Preserve original content for future use in case the block is parsed as
	// invalid, or future serialization attempt results in an error.
	block.originalContent = innerHTML;

	block = getMigratedBlock( block );

	return block;
}

/**
 * Creates a parse implementation for the post content which returns a list of blocks.
 *
 * @param {Function} parseImplementation Parse implementation.
 *
 * @return {Function} An implementation which parses the post content.
 */
export const createParse = ( parseImplementation ) =>
	( content ) => parseImplementation( content ).reduce( ( memo, blockNode ) => {
		const block = createBlockWithFallback( blockNode );
		if ( block ) {
			memo.push( block );
		}
		return memo;
	}, [] );

/**
 * Parses the post content with a PegJS grammar and returns a list of blocks.
 *
 * @param {string} content The post content.
 *
 * @return {Array} Block list.
 */
export const parseWithGrammar = createParse( grammarParse );

export default parseWithGrammar;
