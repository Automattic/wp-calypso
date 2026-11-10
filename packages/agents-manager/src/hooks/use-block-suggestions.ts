import { useSelect } from '@wordpress/data';
import { useMemo } from '@wordpress/element';
import { getBlockSuggestions } from '../utils/editor-suggestions';
import type { EditorBlock } from '../utils/editor-blocks';
import type { Suggestion } from '@automattic/agenttic-ui';

/**
 * The chips for the block selected in the editor. While there are any, they
 * replace the empty view's.
 * @param maxSuggestions - How many to return; all when omitted.
 * @returns The suggestions.
 */
export function useBlockSuggestions( maxSuggestions?: number ): {
	suggestions: Suggestion[];
	replaceEmptyViewSuggestions: boolean;
} {
	// Resolved by name to keep `@wordpress/block-editor` out of this module.
	const selectedBlock = useSelect( ( select ) => {
		const blockEditor = select( 'core/block-editor' ) as {
			getSelectedBlock?: () => EditorBlock | null;
		};

		return blockEditor?.getSelectedBlock?.() ?? null;
	}, [] );

	const suggestions = useMemo(
		() => ( selectedBlock ? getBlockSuggestions( selectedBlock, maxSuggestions ) : [] ),
		[ selectedBlock, maxSuggestions ]
	);

	return { suggestions, replaceEmptyViewSuggestions: suggestions.length > 0 };
}
