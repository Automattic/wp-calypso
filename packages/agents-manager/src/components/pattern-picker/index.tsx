import { store as blockEditorStore } from '@wordpress/block-editor';
import { useDispatch } from '@wordpress/data';
import { memo, useCallback, useEffect } from '@wordpress/element';
import usePatterns from '../../hooks/use-patterns';
import { createBlockRecursively } from '../../utils/create-block-recursively';
import ItemPicker from './item-picker';
import type { BlockData, Layout } from './types';
import './style.scss';

interface Props {
	layouts?: Layout[];
	clientId?: string;
	insertIndex?: number | null;
	isFullLayout?: boolean;
	newPageId?: string;
}

// Caches processed `layouts` across remounts (required for past conversations).
const MAX_CACHE_SIZE = 30;
const layoutsCache = new Map< string, Layout[] >();

const PatternPicker = ( {
	layouts = [],
	clientId,
	insertIndex = null,
	isFullLayout,
	newPageId,
}: Props ) => {
	const { insertBlock } = useDispatch( blockEditorStore );
	const { insertPatterns } = usePatterns();

	const cacheKey = layouts[ 0 ]?.id ?? '';

	// Process all layouts: convert raw block data into real WordPress blocks.
	const processLayouts = useCallback( async () => {
		await Promise.all(
			layouts.map( async ( layout ) => {
				await Promise.all(
					layout.patterns.map( async ( pattern ) => {
						pattern.blocks = ( await Promise.all(
							pattern.blocks.map( ( blockData ) => createBlockRecursively( blockData ) )
						) ) as BlockData[];
					} )
				);
			} )
		);

		if ( newPageId ) {
			// Full-page layout — replace all existing content patterns.
			insertPatterns( layouts[ 0 ].patterns, null, 'replace', false );
		} else if ( clientId && insertIndex !== null ) {
			// Insert a single pattern block at a specific position.
			insertBlock( layouts[ 0 ].patterns[ 0 ].blocks[ 0 ], insertIndex, clientId );
		}
	}, [ layouts, newPageId, clientId, insertIndex, insertPatterns, insertBlock ] );

	// Process layouts once and cache after completion.
	useEffect( () => {
		if ( cacheKey && layoutsCache.has( cacheKey ) ) {
			return;
		}

		processLayouts()
			.then( () => {
				if ( cacheKey ) {
					if ( layoutsCache.size >= MAX_CACHE_SIZE ) {
						const oldestKey = layoutsCache.keys().next().value as string;
						layoutsCache.delete( oldestKey );
					}
					layoutsCache.set( cacheKey, layouts );
				}
			} )
			// eslint-disable-next-line no-console
			.catch( ( error ) => console.error( '[AgentsManager] Failed to process layouts:', error ) );
	}, [ cacheKey, layouts, processLayouts ] );

	// Use cached layouts (with real block objects) for rendering.
	const cachedLayouts = layoutsCache.get( cacheKey ) ?? layouts;
	const firstPattern = cachedLayouts[ 0 ]?.patterns[ 0 ];

	return (
		<ItemPicker
			items={ cachedLayouts }
			clientId={ insertIndex !== null ? firstPattern?.blocks[ 0 ]?.clientId : clientId }
			isFullLayout={ isFullLayout }
		/>
	);
};

export default memo( PatternPicker );
