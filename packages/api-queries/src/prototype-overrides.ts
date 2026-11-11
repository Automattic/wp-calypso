/**
 * PROTOTYPE ONLY (untangling IA). Not part of trunk.
 *
 * A tiny registry that lets the prototype wrap the query function of a few
 * list queries, so mock sites and domains can be injected without touching
 * the pages that consume them. Replaces the removed `AppConfig.queries` seam.
 */
type QueryFnWrapper< T > = ( base: () => Promise< T > ) => Promise< T >;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const wrappers = new Map< string, QueryFnWrapper< any > >();

export type PrototypeOverrideName = 'sites' | 'paginatedSites' | 'domains';

export function setPrototypeQueryFnOverride< T >(
	name: PrototypeOverrideName,
	wrapper: QueryFnWrapper< T >
) {
	wrappers.set( name, wrapper );
}

export function withPrototypeOverride< T >(
	name: PrototypeOverrideName,
	base: () => Promise< T >
): () => Promise< T > {
	return () => {
		const wrapper = wrappers.get( name ) as QueryFnWrapper< T > | undefined;
		return wrapper ? wrapper( base ) : base();
	};
}
