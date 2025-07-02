// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type * as CSS from 'csstype';

// See: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/f6d4d15522356eba4a0267142834e3abc6b603fc/types/react/index.d.ts#L2580-L2587
declare module 'csstype' {
	interface Properties {
		// Allow any CSS Custom Properties
		[ index: `--${ string }` ]: unknown;
	}
}
