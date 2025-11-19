import type { FunctionComponent } from 'react';

interface PassportLogoProps {
	className?: string;
	size?: {
		width?: number;
		height?: number;
	};
	color?: string;
}

export type PassportLogoType = FunctionComponent< PassportLogoProps >;
