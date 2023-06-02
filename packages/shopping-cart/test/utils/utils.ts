import { screen, waitFor } from '@testing-library/react';

export function convertMsToSecs( ms: number ): number {
	return Math.floor( ms / 1000 );
}

// This is a little tricky because we need to verify that text never appears,
// even after some time passes, so we use this slightly convoluted technique:
// https://stackoverflow.com/a/68318058/2615868
export async function verifyThatTextNeverAppears( text: string ): Promise< void > {
	await expect( screen.findByText( text ) ).rejects.toThrow();
}

// This is a little tricky because we need to verify something never happens,
// even after some time passes, so we use this slightly convoluted technique:
// https://stackoverflow.com/a/68318058/2615868
export async function verifyThatNever( expectCallback: () => void ): Promise< void > {
	await expect( waitFor( expectCallback ) ).rejects.toThrow();
}
