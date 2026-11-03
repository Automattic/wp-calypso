import { forwardRef, memo } from 'react';
import type { SVGProps } from 'react';

interface SVGIconOwnProps {
	icon: string;
	name: string;
	size?: number;
}

type SVGIconProps = Omit< SVGProps< SVGSVGElement >, keyof SVGIconOwnProps > & SVGIconOwnProps;

const SVGIcon = memo(
	forwardRef< SVGSVGElement, SVGIconProps >( ( props: SVGIconProps, ref ) => {
		const { icon, size = 24, name = 'icon', ...otherProps } = props;

		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox={ `0 0 ${ size } ${ size }` }
				height={ size }
				width={ size }
				ref={ ref }
				{ ...otherProps }
			>
				<use href={ `${ icon }#${ name }` } />
			</svg>
		);
	} )
);

SVGIcon.displayName = 'SVGIcon';
export default SVGIcon;
