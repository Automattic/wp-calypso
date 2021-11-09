import { it } from '@jest/globals';

// This allows a conditional skip based on the parameter input.
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const itif = ( conditional: boolean ) => ( conditional ? it : it.skip );
