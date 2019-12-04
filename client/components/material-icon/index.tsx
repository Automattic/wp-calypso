/**
 * External dependencies
 */
import classnames from 'classnames';
import React from 'react';
import spritePath from '@automattic/material-design-icons/svg-sprite/material-icons.svg';
import { Assign } from 'utility-types';

interface Props {
	icon: string;
	style?: string;
	size?: number;
}

function MaterialIcon( props: Assign< React.SVGProps< SVGSVGElement >, Props > ) {
	const { size = 24, style = 'outline', icon, onClick, className, ...otherProps } = props;

	// Using a missing icon doesn't produce any errors, just a blank icon, which is the exact intended behaviour.
	// This means we don't need to perform any checks on the icon name.
	const iconName = `material-icon-${ icon }`;
	const iconClass = classnames( 'material-icon', iconName, className );

	const svgId = `icon-${ style }-${ icon }-${ size }px`;

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
			<use xlinkHref={ `${ spritePath }#${ svgId }` } />
		</svg>
	);
}

export default React.memo( MaterialIcon );
