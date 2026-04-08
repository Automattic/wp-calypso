import { store as blockEditorStore } from '@wordpress/block-editor';
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import { TemplatePartPatternSlug } from '../utils/template-parts';
import { unlock } from '../utils/unlock-private-apis';
import useTemplateParts from './use-template-parts';

interface Pattern {
	blocks: Array< { clientId?: string; name?: string; attributes?: Record< string, unknown > } >;
	category?: string;
}

type InsertDirection = 'replace' | 'before' | 'after';

export default function usePatterns() {
	const { insertBlock, replaceBlock, removeBlocks } = useDispatch( blockEditorStore );
	const blockEditorSelector = useSelect( ( select ) => select( blockEditorStore ), [] );
	const { getBlocks, getBlockIndex } = blockEditorSelector as {
		getBlocks: ( rootClientId?: string ) => Array< { clientId: string; name: string } >;
		getBlockIndex: ( clientId: string ) => number;
	};
	const { getSectionRootClientId, getBlockRemovalRules } = unlock( blockEditorSelector ) as {
		getSectionRootClientId: () => string;
		getBlockRemovalRules: () => unknown[];
	};
	const { setBlockRemovalRules } = unlock( useDispatch( blockEditorStore ) ) as {
		setBlockRemovalRules: ( rules: unknown[] ) => void;
	};
	const { replaceTemplatePart } = useTemplateParts();

	const insertPattern = useCallback(
		(
			pattern: unknown,
			index: number,
			rootClientId: string | null = null,
			updateSelection = true
		) => {
			return insertBlock( pattern, index, rootClientId, updateSelection );
		},
		[ insertBlock ]
	);

	const replacePattern = useCallback(
		async ( clientId: string, pattern: { attributes?: Record< string, unknown > } ) => {
			const patternCategory = (
				pattern.attributes?.metadata as Record< string, unknown > | undefined
			 )?.patternCategory as string | undefined;

			if (
				patternCategory &&
				( [ TemplatePartPatternSlug.Header, TemplatePartPatternSlug.Footer ] as string[] ).includes(
					patternCategory
				)
			) {
				await replaceTemplatePart( patternCategory, [ pattern ] );
			} else {
				replaceBlock( clientId, pattern );
			}
		},
		[ replaceBlock, replaceTemplatePart ]
	);

	const insertPatterns = useCallback(
		(
			patternList: Pattern[],
			clientId: string | null = null,
			direction: InsertDirection | null = null,
			updateSelection = true
		): string[] => {
			// Temporarily disable `blockRemovalRules` to prevent the modal from
			// showing when switching layouts.
			const blockRemovalRules = getBlockRemovalRules();
			setBlockRemovalRules( [] );

			const clientIds: string[] = [];
			const insertionBlockId = getSectionRootClientId();
			const shouldReplace = direction === 'replace';

			const insertionIndex = getBlocks( insertionBlockId ).findIndex(
				( block ) => block.name !== 'core/template-part'
			);

			if ( shouldReplace && ! clientId ) {
				const shouldReplaceTemplateParts = patternList.some(
					( pattern ) => pattern.blocks[ 0 ]?.name === 'core/template-part'
				);

				const blocksToReplace = getBlocks( insertionBlockId )
					.filter(
						( block ) => ! ( shouldReplaceTemplateParts && block.name === 'core/template-part' )
					)
					.map( ( block ) => block.clientId );
				removeBlocks( blocksToReplace, updateSelection );
			}

			patternList.forEach( ( pattern, patternIndex ) => {
				const patternRootBlock = pattern.blocks[ 0 ];

				if ( shouldReplace && clientId ) {
					replacePattern( clientId, patternRootBlock );
				} else if ( clientId && direction === 'before' ) {
					insertPattern(
						patternRootBlock,
						getBlockIndex( clientId ),
						insertionBlockId,
						updateSelection
					);
				} else if ( clientId ) {
					insertPattern(
						patternRootBlock,
						getBlockIndex( clientId ) + patternIndex + 1,
						insertionBlockId,
						updateSelection
					);
				} else {
					insertPattern(
						patternRootBlock,
						insertionIndex + patternIndex,
						insertionBlockId,
						updateSelection
					);
				}

				if ( patternRootBlock.clientId ) {
					clientIds.push( patternRootBlock.clientId );
				}
			} );

			// Restore block removal rules.
			setBlockRemovalRules( blockRemovalRules );

			return clientIds;
		},
		[
			getBlockIndex,
			getBlockRemovalRules,
			getBlocks,
			getSectionRootClientId,
			insertPattern,
			removeBlocks,
			replacePattern,
			setBlockRemovalRules,
		]
	);

	return { insertPattern, insertPatterns, replacePattern };
}
