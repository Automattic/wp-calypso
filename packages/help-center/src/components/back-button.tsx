import { Icon, chevronLeft } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';

import './back-button.scss';

export const BackButton = () => {
	const navigate = useNavigate();
	const [ searchParams ] = useSearchParams();
	const { pathname } = useLocation();
	const backButtonRef = useRef< HTMLElement >( null );
	const { __ } = useI18n();

	function handleClick() {
		if ( pathname === '/success' ) {
			navigate( '/' );
		} else if ( searchParams.get( 'query' ) ) {
			navigate( `/?query=${ searchParams.get( 'query' ) }` );
		} else {
			navigate( -1 );
		}
	}

	useEffect( () => {
		const nodeRef = backButtonRef;
		const onBackButtonKeyDown = ( e: KeyboardEvent ) => {
			if ( e.key === 'Enter' ) {
				handleClick();
			}
		};

		if ( nodeRef.current ) {
			nodeRef.current?.addEventListener( 'keydown', onBackButtonKeyDown );
			// Fixes accessibility for back button
			nodeRef.current?.removeAttribute( 'aria-hidden' );
		}
		return () => {
			nodeRef.current?.removeEventListener( 'keydown', onBackButtonKeyDown );
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	return (
		<span className="back-button__help-center">
			<Icon
				aria-label={ __( 'Go Back', __i18n_text_domain__ ) }
				role="button"
				ref={ backButtonRef }
				tabIndex={ 0 }
				data-testid="back-button-icon"
				onClick={ handleClick }
				icon={ chevronLeft }
				size={ 18 }
			/>
		</span>
	);
};
