/**
 * External dependencies
 */
import { uniq } from 'lodash';

/**
 * WordPress dependencies
 */
import { addFilter } from '@wordpress/hooks';
import { hasBlockSupport, getBlockDefaultClassName } from '@wordpress/blocks';

/**
 * Override props assigned to save component to inject generated className if
 * block supports it. This is only applied if the block's save result is an
 * element and not a markup string.
 *
 * @param {Object} extraProps Additional props applied to save element.
 * @param {Object} blockType  Block type.
 *
 * @return {Object} Filtered props applied to save element.
 */
export function addGeneratedClassName( extraProps, blockType ) {
	// Adding the generated className
	if ( hasBlockSupport( blockType, 'className', true ) ) {
		if ( typeof extraProps.className === 'string' ) {
			// We have some extra classes and want to add the default classname
			// We use uniq to prevent duplicate classnames

			extraProps.className = uniq( [
				getBlockDefaultClassName( blockType.name ),
				...extraProps.className.split( ' ' ),
			] ).join( ' ' ).trim();
		} else {
			// There is no string in the className variable,
			// so we just dump the default name in there
			extraProps.className = getBlockDefaultClassName( blockType.name );
		}
	}
	return extraProps;
}

addFilter( 'blocks.getSaveContent.extraProps', 'core/generated-class-name/save-props', addGeneratedClassName );
