import classnames from 'classnames';
import {
	iconsThatNeedOffset,
	iconsThatNeedOffsetX,
	iconsThatNeedOffsetY,
} from 'gridicons/dist/util/icons-offset';
import spritePath from 'gridicons/svg-sprite/gridicons.svg';
import React from 'react';
import type { ReactNode } from 'react';
import type { Assign } from 'utility-types';

interface Props {
	icon: string;
	size?: number;
	title?: ReactNode;
}

type AllProps = Assign< React.SVGProps< SVGSVGElement >, Props >;

const Gridicon = React.memo(
	React.forwardRef< SVGSVGElement, AllProps >( ( props: AllProps, ref ) => {
		const { size = 24, icon, className, title, ...otherProps } = props;
		const isModulo18 = size % 18 === 0;

		// Using a missing icon doesn't produce any errors, just a blank icon, which is the exact intended behaviour.
		// This means we don't need to perform any checks on the icon name.
		const iconName = `gridicons-${ icon }`;

		const iconClass = classnames( 'gridicon', iconName, className, {
			'needs-offset': isModulo18 && iconsThatNeedOffset.includes( iconName ),
			'needs-offset-x': isModulo18 && iconsThatNeedOffsetX.includes( iconName ),
			'needs-offset-y': isModulo18 && iconsThatNeedOffsetY.includes( iconName ),
		} );

		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				className={ iconClass }
				height={ size }
				width={ size }
				ref={ ref }
				{ ...otherProps }
			>
				{ title && <title>{ title }</title> }
				<use xlinkHref={ `${ spritePath }#${ iconName }` } />
			</svg>
		);
	} )
);

Gridicon.displayName = 'Gridicon';

export default Gridicon;
