import { registerBlockType } from '@wordpress/blocks';
import { addFilter } from '@wordpress/hooks';
import { CAROUSEL_BLOCK_NAME } from './consts';
import { settings } from './synced-newspack-blocks/blocks/carousel/index';

function setBlockTransformationName( name ) {
	return name !== 'newspack-blocks/carousel' ? name : CAROUSEL_BLOCK_NAME;
}

addFilter(
	'blocks.transforms_from_name',
	'set-transformed-block-name',
	setBlockTransformationName
);

registerBlockType( CAROUSEL_BLOCK_NAME, {
	...settings,
	category: 'widgets',
} );
