import { setupIntersectionMocking } from 'react-intersection-observer/test-utils';
import { beforeEach, vi } from 'vitest';

export * from 'react-intersection-observer/test-utils';

// `react-intersection-observer/test-utils` mocks `IntersectionObserver` with `vi.fn()` around an
// arrow function, which Vitest can't call with `new`. Set it up again around a regular function.
beforeEach( () => {
	setupIntersectionMocking( ( ( implementation?: ( ...args: unknown[] ) => unknown ) =>
		vi.fn(
			implementation &&
				function ( ...args: unknown[] ) {
					return implementation( ...args );
				}
		) ) as typeof vi.fn );
} );
