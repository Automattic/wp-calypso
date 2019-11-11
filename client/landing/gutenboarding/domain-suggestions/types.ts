// With a _real_ TypeScript compiler, we could use const enums.
/* const */ enum ActionType {
	RECEIVE_DOMAIN_SUGGESTIONS = 'RECEIVE_DOMAIN_SUGGESTIONS',
}
export { ActionType };

/**
 * Parameters type of a function, excluding the first parameter.
 *
 * This is useful for typing some @wordpres/data functions that make a leading
 * `state` argument implicit.
 */
export type TailParameters< F extends ( head: any, ...tail: any[] ) => any > = F extends (
	head: any,
	...tail: infer PS
) => any
	? PS
	: never;
