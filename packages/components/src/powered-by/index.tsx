import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { forwardRef, isValidElement, cloneElement, useState } from 'react';
import { WooLogo } from './temp-logos/woo';
import { PoweredByProps } from './types';
import { getAccessibleLogoText } from './utils';
import './styles.scss';

export const PoweredBy = forwardRef< HTMLElement, PoweredByProps >( function PoweredBy(
	{ renderLogo, className, ...props },
	ref
) {
	const { __ } = useI18n();

	const [ brandName, setBrandName ] = useState< string >();

	let logo;
	if ( isValidElement( renderLogo ) ) {
		logo = cloneElement( renderLogo, {
			// TODO: remove the dependency on the logos once all logos are updated and
			// normalized to have the same visual "weight" and alignment given the same size.
			height: renderLogo.type === WooLogo ? 18 : 25,
			...renderLogo.props,
			className: clsx( renderLogo.props.className, 'a8c-components-powered-by__logo' ),
			ref: ( element: HTMLElement | null ) => {
				setBrandName( getAccessibleLogoText( element ) );
			},
		} );
	}

	if ( ! logo ) {
		return null;
	}

	const label =
		props[ 'aria-label' ] ??
		// TODO: use @wordpress/react-i18n if possible
		( brandName ? sprintf( 'Powered by %s', brandName ) : undefined );

	return (
		<p
			{ ...props }
			aria-label={ label }
			// If there is no meaningful label, hide the element from screen readers.
			aria-hidden={ props[ 'aria-hidden' ] ?? ( label ? undefined : 'true' ) }
			className={ clsx( className, 'a8c-components-powered-by' ) }
			// Casting here is safe because we know that HTMLElement
			// is just a more generic type of HTMLParagraphElement
			ref={ ref as React.Ref< HTMLParagraphElement > }
		>
			<span className="a8c-components-powered-by__text">{ __( 'Powered by' ) }</span>
			{ logo }
		</p>
	);
} );
