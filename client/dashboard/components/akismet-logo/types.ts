import type { FunctionComponent } from 'react';

interface AkismetLogoProps {
	className?: string;
	size?: {
		width?: number;
		height?: number;
	};
	color?: string;
}

export type AkismetLogoType = FunctionComponent< AkismetLogoProps >;
