// These allow a conditional skip based on the parameter input.

export const skipItIf = ( conditional: boolean ) => ( conditional ? it.skip : it );
export const skipDescribeIf = ( conditional: boolean ) =>
	conditional ? describe.skip : describe;
