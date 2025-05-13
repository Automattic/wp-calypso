import { CommonLogoProps } from './temp-logos/types';

export interface PoweredByProps extends React.HTMLAttributes< HTMLElement > {
	renderLogo: React.ReactElement<
		CommonLogoProps & {
			className?: string;
			ref?: React.Ref< HTMLElement >;
		}
	>;
}
