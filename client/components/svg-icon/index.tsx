/**
 * External dependencies
 */
import classnames from 'classnames';
import React from 'react';
import { Assign } from 'utility-types';

interface Props {
	icon: string;
	classes: string;
	name: string;
	size?: number;
}

function SVGIcon( props: Assign< React.SVGProps< SVGSVGElement >, Props > ) {
	const { size = 24, name = 'a8c-logo', onClick, classes, icon, ...otherProps } = props;
	const iconName = `svg-icon-${ name }`;
	const iconClass = classnames( 'svg-icon', iconName, classes );

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			className={ iconClass }
			height={ size }
			width={ size }
			onClick={ onClick }
			{ ...otherProps }
		>
			<use xlinkHref={ `${ icon }#${ name }` } />
		</svg>
	);
}

export default React.memo( SVGIcon );
