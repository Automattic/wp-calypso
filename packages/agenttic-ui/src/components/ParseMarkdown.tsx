/**
 * ParseMarkdown Component
 *
 * A dedicated component for rendering markdown content using store-based components along
 * with standard parsing from react-markdown.
 */

import { useSelect } from '@wordpress/data';
import React from 'react';
import Markdown from 'react-markdown';
import { STORE_NAME } from '../store';
import type { StoreSelectors } from '../store/types';

interface ParseMarkdownProps {
	children: string;
	className?: string;
}

export const ParseMarkdown: React.FC< ParseMarkdownProps > = ( {
	children,
	className,
} ) => {
	const markdownComponents = useSelect( ( select ) => {
		const store = select( STORE_NAME ) as StoreSelectors;
		return store.getRegisteredMarkdownComponents();
	}, [] );

	return (
		<div className={ className }>
			<Markdown components={ markdownComponents }>{ children }</Markdown>
		</div>
	);
};
