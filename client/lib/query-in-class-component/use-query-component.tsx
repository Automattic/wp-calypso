import { useQuery } from '@tanstack/react-query';
import type { UseQueryOptions, UseQueryResult } from '@tanstack/react-query';

/**
 * An HoC that allows you to call useQuery in a class component.
 * @param props Props
 * @param props.options The options to pass to useQuery
 * @param props.children React children that will receive the result of the query
 * @returns The result of the query
 */
export function UseQuery< Response >( props: {
	options: UseQueryOptions< Response >;
	children: ( data: UseQueryResult< Response > ) => JSX.Element;
} ) {
	return props.children( useQuery( props.options ) );
}
