import type { ApiQueriesMutationMeta } from '@automattic/api-queries';
import type { UseMutationOptions } from '@tanstack/react-query';

/**
 * The snackbars to show when a mutation settles. A message is a string, or a
 * function of the mutation's result that returns one. A function that returns
 * `undefined` shows no snackbar.
 */
export interface Snackbar< TData = unknown, TError = Error, TVariables = unknown > {
	success?: string | ( ( data: TData, variables: TVariables ) => string | undefined );
	error?:
		| string
		| { source: 'server' }
		| ( ( error: TError, variables: TVariables ) => string | undefined );
}

declare module '@automattic/api-queries' {
	interface ApiQueriesMutationMeta {
		// `meta` is shared by every mutation, so it can't carry one mutation's types.
		// `withSnackbar()` checks them against the factory instead.
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		snackbar?: Snackbar< any, any, any >;
	}
}

type SnackbarFor< T > =
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	T extends UseMutationOptions< infer TData, infer TError, infer TVariables, any >
		? Snackbar< TData, TError, TVariables >
		: Snackbar;

/**
 * Attaches a snackbar to a mutation's `meta` object, preserving the existing `meta`
 * fields defined in `@automattic/api-queries`.
 */
export function withSnackbar< T extends { meta?: ApiQueriesMutationMeta } >(
	options: T,
	snackbar: SnackbarFor< T >
): T {
	// eslint-disable-next-line no-restricted-syntax -- this is the merge the rule points at.
	return { ...options, meta: { ...options.meta, snackbar } };
}
