/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { withFilters } from '@wordpress/components';
import { getBlockDefaultClassName, hasBlockSupport, getBlockType } from '@wordpress/blocks';

export const Edit = ( props ) => {
	const { attributes = {}, name } = props;
	const blockType = getBlockType( name );

	if ( ! blockType ) {
		return null;
	}

	// Generate a class name for the block's editable form
	const generatedClassName = hasBlockSupport( blockType, 'className', true ) ?
		getBlockDefaultClassName( name ) :
		null;
	const className = classnames( generatedClassName, attributes.className );

	// `edit` and `save` are functions or components describing the markup
	// with which a block is displayed. If `blockType` is valid, assign
	// them preferentially as the render value for the block.
	const Component = blockType.edit || blockType.save;

	return (
		<Component
			{ ...props }
			className={ className }
		/>
	);
};

export default withFilters( 'editor.BlockEdit' )( Edit );
