import clsx from 'clsx';
import {
	iconsThatNeedOffset,
	iconsThatNeedOffsetX,
	iconsThatNeedOffsetY,
} from 'gridicons/dist/util/icons-offset';
import spritePath from 'gridicons/svg-sprite/gridicons.svg';
import * as React from 'react';
import type { ReactNode } from 'react';
import type { Assign } from 'utility-types';

interface Props {
	icon: string;
	size?: number;
	title?: ReactNode;
}

type AllProps = Assign< React.SVGProps< SVGSVGElement >, Props >;

/**
 * Fetches the SVG file and creates a proxy URL for it.
 * @param url the original cross-origin URL
 * @returns the proxied URL.
 */
function useProxiedURL( url: string ) {
	const [ urlProxy, setUrlProxy ] = React.useState( url );
	React.useEffect( () => {
		// Only bother with cross-origin absolute URLs.
		if ( url.startsWith( 'https://' ) && window.location.origin !== new URL( url ).origin ) {
			fetch( url )
				.then( ( res ) => res.blob() )
				.then( ( blob ) => {
					const urlProxy = URL.createObjectURL( blob );
					setUrlProxy( urlProxy );
				} );
		}
	}, [ url ] );

	return urlProxy;
}

const Gridicon = React.memo(
	React.forwardRef< SVGSVGElement, AllProps >( ( props: AllProps, ref ) => {
		const { size = 24, icon, className, title, ...otherProps } = props;
		const isModulo18 = size % 18 === 0;

		// Proxy URL to support cross-origin SVGs.
		const proxiedSpritePath = useProxiedURL( spritePath );

		// Using a missing icon doesn't produce any errors, just a blank icon, which is the exact intended behaviour.
		// This means we don't need to perform any checks on the icon name.
		const iconName = `gridicons-${ icon }`;

		const iconClass = clsx( 'gridicon', iconName, className, {
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
				<use xlinkHref={ `${ proxiedSpritePath }#${ iconName }` } />
			</svg>
		);
	} )
);

Gridicon.displayName = 'Gridicon';

export default Gridicon;
