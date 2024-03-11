import type { Context } from '@automattic/calypso-router';
import type { QueryClient } from '@tanstack/react-query';
import type { Pattern } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/pattern-assembler/types';
import type { PartialContext as PerformanceMarkContext } from 'calypso/server/lib/performance-mark';

export type RouterNext = ( error?: Error ) => void;

export type RouterContext = Context &
	PerformanceMarkContext & {
		cachedMarkup?: string;
		queryClient: QueryClient;
	};

export type { Pattern };

type CategoryBase = {
	name: string;
	label: string;
	description: string;
};

export type CategorySnakeCase = CategoryBase & {
	page_pattern_count: number;
	preview_pattern: Pattern | null;
	regular_cattern_count: number;
};

export type Category = CategoryBase & {
	pagePatternCount: number;
	previewPattern: Pattern | null;
	regularPatternCount: number;
};

type CategoryWithCount = Category & {
	count: number;
};

export type CategoryGalleryProps = {
	categories?: CategoryWithCount[];
	columnCount?: number;
	description: string;
	title: string;
};

export type CategoryGalleryFC = React.FC< CategoryGalleryProps >;

export type PatternGalleryProps = {
	isGridView?: boolean;
	patterns?: Pattern[];
};

export type PatternGalleryFC = React.FC< PatternGalleryProps >;
