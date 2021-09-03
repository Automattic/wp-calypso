import { keyframes } from '@emotion/react';
import type { Keyframes } from '@emotion/serialize';

export const pulse: Keyframes = keyframes`
	0% { opacity: 1; }

	70% { opacity: 0.25; }

	100% { opacity: 1; }
`;
