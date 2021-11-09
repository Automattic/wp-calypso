import { it, describe } from '@jest/globals';

// These allow a conditional skip based on the parameter input.

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const itif = ( conditional: boolean ) => ( conditional ? it : it.skip );

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const describeif = ( conditional: boolean ) => ( conditional ? describe : describe.skip );
