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
	page_preview_pattern: Pattern | null;
	regular_pattern_count: number;
	regular_preview_pattern: Pattern | null;
};

export type Category = CategoryBase & {
	pagePatternCount: number;
	pagePreviewPattern: Pattern | null;
	regularPatternCount: number;
	regularPreviewPattern: Pattern | null;
};

type CategoryGalleryProps = {
	categories?: Category[];
	description: string;
	patternType: 'regular' | 'pages';
	title: string;
};

export type CategoryGalleryFC = React.FC< CategoryGalleryProps >;

type PatternGalleryProps = {
	isGridView?: boolean;
	patterns?: Pattern[];
};

export type PatternGalleryFC = React.FC< PatternGalleryProps >;
