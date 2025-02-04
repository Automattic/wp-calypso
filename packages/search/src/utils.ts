import * as React from 'react';

/**
 * A `React.useEffect` that will not run on the first render.
 *
 * Source:
 * https://github.com/reakit/reakit/blob/HEAD/packages/reakit-utils/src/useUpdateEffect.ts
 * @param effect The effect.
 * @param deps Dependencies of the effect.
 */
export function useUpdateEffect( effect: React.EffectCallback, deps: React.DependencyList ): void {
	const mounted = React.useRef( false );
	React.useEffect( () => {
		if ( mounted.current ) {
			return effect();
		}
		mounted.current = true;
		return undefined;
		// eslint-disable-next-line
	}, deps );
}
