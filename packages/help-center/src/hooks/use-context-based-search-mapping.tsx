import { useSelect } from '@wordpress/data';
import { useQueryForRoute } from '../route-to-query-mapping';

interface CoreBlockEditor {
	getSelectedBlock: () => object;
}

interface BlockStore {
	getBlockTypes: () => [ value: { name: string } ];
	getBlockType: ( arg0: string ) => { title: string; name: string };
}

// Returns the search query based on the current route.
// The search query will be determined based on the selected Gutenberg block, an exact match with URL mapping, or a fuzzy match (in this specific order).
export function useContextBasedSearchMapping( currentRoute: string | undefined ) {
	// When using a block in the editor, it will be used to search for help articles based on the block name.
	const blockSearchQuery = useSelect( ( select: ( store: string ) => CoreBlockEditor ) => {
		const selectedBlock = select( 'core/block-editor' )?.getSelectedBlock();
		if ( selectedBlock ) {
			const blockType = ( select( 'core/blocks' ) as unknown as BlockStore )?.getBlockType(
				( selectedBlock as { name: string } ).name
			);
			return blockType?.title || blockType?.name;
		}
		return '';
	}, [] );

	const urlSearchQuery = useQueryForRoute( currentRoute ?? '' );

	return {
		contextSearch: blockSearchQuery || urlSearchQuery || '',
	};
}
