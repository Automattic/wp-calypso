import type { Context } from '@automattic/calypso-router';
import type { QueryClient } from '@tanstack/react-query';

export type RouterNext = ( error?: Error ) => void;

export type RouterContext = Context & {
	cachedMarkup?: string;
	queryClient: QueryClient;
};

export type {
	Category,
	Pattern,
} from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/pattern-assembler/types';
