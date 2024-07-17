import type { Context } from '@automattic/calypso-router';
import type { QueryClient } from '@tanstack/react-query';
import type { Pattern as AssemblerPattern } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/pattern-assembler/types';
import type { PartialContext as PerformanceMarkContext } from 'calypso/server/lib/performance-mark';

export type RouterNext = ( error?: Error ) => void;

export type RouterContext = Context &
	PerformanceMarkContext & {
		cachedMarkup?: string;
		queryClient: QueryClient;
	};

export type Pattern = AssemblerPattern & {
	can_be_copied_without_account?: boolean;
};

export enum PatternTypeFilter {
	PAGES = 'pages',
	REGULAR = 'regular',
}

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
	patternTypeFilter: PatternTypeFilter;
	title: string;
};

export type CategoryGalleryFC = React.FC< CategoryGalleryProps >;

export type PatternGalleryProps = {
	category: string;
	displayPlaceholder?: boolean;
	getPatternPermalink?( pattern: Pattern ): string;
	isGridView?: boolean;
	patterns?: Pattern[];
};

export type PatternGalleryFC = React.FC< PatternGalleryProps >;

export type ReadymadeTemplateDetailsProps = {
	id: number;
};
export type ReadymadeTemplateDetailsFC = React.FC< ReadymadeTemplateDetailsProps >;

export type PatternType = 'pattern' | 'page-layout';
export type PatternView = 'grid' | 'list';

type ReadymadeTemplatePattern = {
	id: number;
	source_site_sid: number;
};

export type ReadymadeTemplate = {
	template_id: number;
	title: string;
	description: string;
	home: {
		header: string;
		content: string;
		footer: string;
	};
	patterns: ReadymadeTemplatePattern[];
};
