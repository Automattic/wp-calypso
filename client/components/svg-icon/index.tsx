import clsx from 'clsx';
import * as React from 'react';
import { Assign } from 'utility-types';

interface Props {
	icon: string;
	classes: string;
	name: string;
	size?: number;
}

type AllProps = Assign< React.SVGProps< SVGSVGElement >, Props >;

const SVGIcon = React.forwardRef< SVGSVGElement, AllProps >( ( props: AllProps, ref ) => {
	const { size = 24, name = 'a8c-logo', onClick, classes, icon, ...otherProps } = props;
	const iconName = `svg-icon-${ name }`;
	const iconClass = clsx( 'svg-icon', iconName, classes );

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox={ `0 0 ${ size } ${ size }` }
			className={ iconClass }
			height={ size }
			width={ size }
			onClick={ onClick }
			ref={ ref }
			{ ...otherProps }
		>
			<use xlinkHref={ `${ icon }#${ name }` } />
		</svg>
	);
} );

export default React.memo( SVGIcon );
