/// TODO: Move this into @automattic/js-utils or something like that
export function notNullish< T >( t: T | null | undefined ): t is T {
	return t !== null && t !== undefined;
}
