import { it, describe } from '@jest/globals';

// This allows a conditional skip based on the parameter input.
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const itSkipIf = ( conditional: boolean ) => ( conditional ? it.skip : it );

export const describeSkipIf = ( conditional: boolean ) =>
	conditional ? describe.skip : describe;
