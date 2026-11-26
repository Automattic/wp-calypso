import type { ApiQueriesMutationMeta } from '@automattic/api-queries';
import type { UseMutationOptions } from '@tanstack/react-query';

/**
 * The snackbars to show when a mutation settles. A message is a string, or a
 * function of the mutation's result that returns one. A function that returns
 * `undefined` shows no snackbar. Messages use the values from the render that
 * called `mutate()`, even if the component re-renders before it settles.
 *
 * `withSnackbar()` only decides what users see; keep component work in
 * `onSuccess` and `onError`. When both depend on the same condition, check it
 * in each.
 *
 * For `error`, prefer `{ source: 'server' }`: the error's own message, or a
 * generic one when it is empty. Use a string when the server's text isn't fit
 * for users, and a function only when the text depends on the error's code or
 * the variables.
 * @example
 * useMutation(
 * 	withSnackbar( sitePHPVersionMutation( siteId ), {
 * 		success: ( _data, version ) =>
 * 			// translators: %s: PHP version
 * 			sprintf( __( 'PHP version changed to %s.' ), version ),
 * 		error: { source: 'server' },
 * 	} )
 * );
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
		snackbar?: Snackbar< unknown, unknown, unknown >;
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
	// `meta` is shared by every mutation, so it can't keep this one's types. The
	// callbacks were checked against the factory, and the handler only ever calls
	// them with this mutation's own result.
	const stored = snackbar as Snackbar< unknown, unknown, unknown >;
	// eslint-disable-next-line no-restricted-syntax -- this is the merge the rule points at.
	return { ...options, meta: { ...options.meta, snackbar: stored } };
}
