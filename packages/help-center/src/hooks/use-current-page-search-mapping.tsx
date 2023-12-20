import { store as blocksStore } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';
import currentPageSearchMapping from '../route-to-query-mapping.json';

interface CoreBlockEditor {
	getSelectedBlock: () => object;
}

interface BlockStore {
	getBlockTypes: () => [ value: { name: string } ];
}

export function useCurrentPageSearchMapping( currentRoute: string | undefined ) {
	let searchQuery = '';

	const selectedBlock = useSelect(
		( select: ( store: string ) => CoreBlockEditor ) =>
			select( 'core/block-editor' )?.getSelectedBlock(),
		[]
	);

	const blockTypes = useSelect(
		( select: ( store: string ) => BlockStore ) => select( blocksStore )?.getBlockTypes(),
		[]
	);

	// Set search query based on selected block in editor
	if ( selectedBlock && blockTypes ) {
		blockTypes.forEach( ( blockType ) => {
			const blockName = blockType.name;
			if ( ( selectedBlock as { name: string } ).name === blockName ) {
				searchQuery = blockName;
				return;
			}
		} );

		if ( searchQuery ) {
			return searchQuery;
		}
	}

	// Set search query based on current route
	if ( currentRoute ) {
		for ( const key in currentPageSearchMapping ) {
			if ( currentRoute.startsWith( key ) ) {
				searchQuery = currentPageSearchMapping[ key as keyof typeof currentPageSearchMapping ];
				break;
			}
		}
	}
	return searchQuery;
}
