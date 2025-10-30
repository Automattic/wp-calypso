/**
 * External dependencies
 */
import { css } from '@emotion/react';

export const boxSizingReset = css`
	box-sizing: border-box;

	*,
	*::before,
	*::after {
		box-sizing: inherit;
	}
`;
