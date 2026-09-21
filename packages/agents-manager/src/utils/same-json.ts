/** Whether two values serialize alike, an absent one counting as `null`. */
export const sameJson = ( a: unknown, b: unknown ): boolean =>
	JSON.stringify( a ?? null ) === JSON.stringify( b ?? null );
