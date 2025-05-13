interface PoweredByLogoProps {
	size?: number;
	className?: string;
}

export interface PoweredByProps extends React.HTMLAttributes< HTMLElement > {
	renderLogo: React.ReactElement<
		PoweredByLogoProps & {
			ref?: React.Ref< HTMLElement >;
		}
	>;
}
