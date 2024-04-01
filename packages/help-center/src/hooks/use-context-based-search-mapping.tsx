import { useSelect } from '@wordpress/data';
import urlMapping from '../route-to-query-mapping.json';
import tailoredArticlesMapping from '../tailored-post-ids-mapping.json';

interface CoreBlockEditor {
	getSelectedBlock: () => object;
}

interface BlockStore {
	getBlockTypes: () => [ value: { name: string } ];
	getBlockType: ( arg0: string ) => { title: string; name: string };
}

// When using a block in the editor, it will be used to search for help articles based on the block name.
export function useContextBasedSearchMapping( currentRoute: string | undefined ) {
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

	// Fuzzier matches
	const urlMatchKey = Object.keys( urlMapping ).find( ( key ) => currentRoute?.startsWith( key ) );
	const urlSearchQuery = urlMatchKey ? urlMapping[ urlMatchKey as keyof typeof urlMapping ] : '';
	const tailoredArticlesMatchKey = Object.keys( tailoredArticlesMapping ).find(
		( key ) => currentRoute?.startsWith( key )
	);
	const tailoredArticles = tailoredArticlesMatchKey
		? tailoredArticlesMapping[ tailoredArticlesMatchKey as keyof typeof tailoredArticlesMapping ]
		: [];

	// Find exact URL matches
	const exactMatch = urlMapping[ currentRoute as keyof typeof urlMapping ];
	if ( exactMatch ) {
		return { contextSearch: exactMatch, tailoredArticles };
	}

	return {
		contextSearch: blockSearchQuery || urlSearchQuery || '',
		tailoredArticles,
	};
}
