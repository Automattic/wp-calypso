import type { Context } from '@automattic/calypso-router';
import type { QueryClient } from '@tanstack/react-query';
import type {
	Category,
	Pattern,
} from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/pattern-assembler/types';

export type RouterNext = ( error?: Error ) => void;

export type RouterContext = Context & {
	cachedMarkup?: string;
	queryClient: QueryClient;
};

export type { Category, Pattern };

export type PatternGalleryProps = {
	isGridView?: boolean;
	patterns?: Pattern[];
};

export type PatternGalleryFC = React.FC< PatternGalleryProps >;
