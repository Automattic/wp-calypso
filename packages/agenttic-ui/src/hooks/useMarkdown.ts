/**
 * useMarkdown Hook
 *
 * Provides a clean API for external consumers to register markdown components
 * and extensions, following the same pattern as useSuggestions.
 */

import { useDispatch, useSelect } from '@wordpress/data';
import type { Components } from 'react-markdown';
import type { MarkdownExtensions } from '../markdown-extensions';
import { STORE_NAME } from '../store';
import type { StoreActions, StoreSelectors } from '../store/types';

export const useMarkdown = () => {
	const {
		registerMarkdownComponents,
		registerMarkdownExtensions,
		clearMarkdownComponents,
		clearMarkdownExtensions,
	} = useDispatch( STORE_NAME ) as StoreActions;

	const selectors = useSelect( ( select ) => {
		const store = select( STORE_NAME ) as StoreSelectors;
		return {
			getRegisteredMarkdownComponents:
				store.getRegisteredMarkdownComponents,
			getRegisteredMarkdownExtensions:
				store.getRegisteredMarkdownExtensions,
		};
	}, [] );

	return {
		// Actions
		registerMarkdownComponents: ( components: Components ) =>
			registerMarkdownComponents( components ),
		registerMarkdownExtensions: ( extensions: MarkdownExtensions ) =>
			registerMarkdownExtensions( extensions ),
		clearMarkdownComponents: () => clearMarkdownComponents(),
		clearMarkdownExtensions: () => clearMarkdownExtensions(),

		// Selectors
		...selectors,
	};
};
