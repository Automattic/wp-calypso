import { it, describe } from '@jest/globals';

// These allow a conditional skip based on the parameter input.

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const skipItIf = ( conditional: boolean ) => ( conditional ? it.skip : it );

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const skipDescribeIf = ( conditional: boolean ) =>
	conditional ? describe.skip : describe;
