/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import {
	iconsThatNeedOffset,
	iconsThatNeedOffsetX,
	iconsThatNeedOffsetY,
} from 'gridicons/dist/util/icons-offset';
import spritePath from 'gridicons/svg-sprite/gridicons.svg';
import { Assign } from 'utility-types';

function needsOffset( name: string, icons: string[] ) {
	return icons.indexOf( name ) >= 0;
}

interface Props {
	icon: string;
	size?: number;
}
type AllProps = Assign< React.SVGProps< SVGSVGElement >, Props >;

const Gridicon = React.forwardRef< SVGSVGElement, AllProps >( ( props: AllProps, ref ) => {
	const { size = 24, icon, onClick, className, title, ...otherProps } = props;
	const isModulo18 = size % 18 === 0;

	// Using a missing icon doesn't produce any errors, just a blank icon, which is the exact intended behaviour.
	// This means we don't need to perform any checks on the icon name.
	const iconName = `gridicons-${ icon }`;
	const offsetClasses = isModulo18
		? [
				needsOffset( iconName, iconsThatNeedOffset ) ? 'needs-offset' : false,
				needsOffset( iconName, iconsThatNeedOffsetX ) ? 'needs-offset-x' : false,
				needsOffset( iconName, iconsThatNeedOffsetY ) ? 'needs-offset-y' : false,
		  ]
		: [];
	const iconClass = classnames( 'gridicon', iconName, className, ...offsetClasses );
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			className={ iconClass }
			height={ size }
			width={ size }
			onClick={ onClick }
			ref={ ref }
			{ ...otherProps }
		>
			{ title && <title>{ title }</title> }
			<use xlinkHref={ `${ spritePath }#${ iconName }` } />
		</svg>
	);
} );

export default React.memo( Gridicon );
