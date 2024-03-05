import type { Context } from '@automattic/calypso-router';
import type { QueryClient } from '@tanstack/react-query';
import type { Pattern } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/pattern-assembler/types';

export type RouterNext = ( error?: Error ) => void;

export type RouterContext = Context & {
	cachedMarkup?: string;
	queryClient: QueryClient;
};

export type { Pattern };

export type Category = {
	name: string;
	label: string;
	description: string;
	pattern_count: number;
	page_pattern_count: number;
};

export type PatternGalleryProps = {
	isGridView?: boolean;
	patterns?: Pattern[];
};

export type PatternGalleryFC = React.FC< PatternGalleryProps >;
