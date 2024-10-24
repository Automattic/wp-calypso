import { useI18n } from '@wordpress/react-i18n';
import { type HTMLProps, useEffect, useState } from 'react';

interface Props extends Omit< HTMLProps< HTMLAnchorElement >, 'href' > {
	href: string | null | undefined;
}

export const LinkWithRedirect = ( props: Props ) => {
	const [ delayedEvent, setDelayedEvent ] =
		useState< React.MouseEvent< HTMLAnchorElement > | null >( null );
	const { __ } = useI18n();

	const { children, href, onClick } = props;

	const onClickHandler = ( e: React.MouseEvent< HTMLAnchorElement > ) => {
		e.preventDefault();
		if ( ! href ) {
			setDelayedEvent( e );
		} else {
			onClick?.( e );
		}
	};

	useEffect( () => {
		if ( href && delayedEvent ) {
			onClick?.( delayedEvent );
			window.location.assign( href );
		}
	}, [ href, delayedEvent, onClick ] );

	return (
		<a { ...props } href={ href ?? '#' } onClick={ onClickHandler }>
			{ delayedEvent ? __( 'Redirecting' ) : children }
		</a>
	);
};
