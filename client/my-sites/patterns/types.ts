import { GlobalStylesObject } from '@automattic/global-styles';
import type { Context } from '@automattic/calypso-router';
import type { QueryClient } from '@tanstack/react-query';
import type { PartialContext as PerformanceMarkContext } from 'calypso/server/lib/performance-mark';

export type RouterNext = ( error?: Error ) => void;

export type RouterContext = Context &
	PerformanceMarkContext & {
		cachedMarkup?: string;
		queryClient: QueryClient;
	};

export type PatternCategory = {
	name?: string;
	title?: string;
	slug?: string;
	label?: string;
	description?: string;
};

export type PatternTag = {
	slug: string;
	title: string;
	description: string;
};

export type Pattern = {
	ID: number;
	name: string;
	title: string;
	description?: string;
	category?: PatternCategory;
	categories: Record< string, PatternCategory | undefined >;
	key?: string;
	pattern_meta?: Record< string, boolean | undefined >;
	html?: string;
	tags: Record< string, PatternTag | undefined >;
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
	slug: string;
};
export type ReadymadeTemplateDetailsFC = React.FC< ReadymadeTemplateDetailsProps >;
export type ReadymadeTemplatesProps = {
	readymadeTemplates: ReadymadeTemplate[];
	forwardRef: React.RefObject< HTMLDivElement > | null;
};
export type ReadymadeTemplatesFC = React.FC< ReadymadeTemplatesProps >;

export type PatternType = 'pattern' | 'page-layout';
export type PatternView = 'grid' | 'list';

type ReadymadeTemplatePattern = {
	id: number;
	source_site_sid: number;
};
type ReadymadeTemplateStyles = {
	colors?: string;
	typography?: string;
};

export type ReadymadeTemplate = {
	template_id: number;
	slug: string;
	title: string;
	description: string;
	home: {
		header: string;
		content: string;
		footer: string;
	};
	patterns: ReadymadeTemplatePattern[];
	styles: ReadymadeTemplateStyles;
	globalStyles?: GlobalStylesObject;
	previewUrl: string;
};
