import { useTranslate } from 'i18n-calypso';
import { useEffect, useCallback } from 'react';
import { closeOnFocusOut } from '../utils';
import type { MouseEvent, FC, SetStateAction, Dispatch, RefObject } from 'react';

interface MobileMenuButtonProps {
	isOpen: boolean;
	setIsOpen: Dispatch< SetStateAction< boolean > >;
	mobileMenu: RefObject< HTMLDivElement >;
}

const MobileMenuButton: FC< MobileMenuButtonProps > = ( { isOpen, setIsOpen, mobileMenu } ) => {
	const translate = useTranslate();

	const menuToggle = useCallback( () => {
		setIsOpen( ( open ) => {
			if ( ! open ) {
				document.body.classList.add( 'no-scroll' );
			} else {
				document.body.classList.remove( 'no-scroll' );
			}
			return ! open;
		} );
	}, [ setIsOpen ] );

	const onKeyDown = useCallback(
		( e: KeyboardEvent ) => {
			if ( e.key === 'Escape' && isOpen ) {
				menuToggle();
			}
		},
		[ menuToggle, isOpen ]
	);

	const onButtonClick = ( e: MouseEvent ) => {
		e.preventDefault();

		menuToggle();
	};

	const onBlur = () => {
		closeOnFocusOut( mobileMenu, isOpen, menuToggle );
	};

	useEffect( () => {
		document.addEventListener( 'keydown', onKeyDown );

		return () => {
			document.removeEventListener( 'keydown', onKeyDown );
		};
	}, [ onKeyDown ] );

	return (
		<a
			className="header__mobile-btn mobile-btn js-mobile-btn"
			href="#mobile-menu"
			onClick={ onButtonClick }
			onBlur={ onBlur }
			aria-expanded={ isOpen }
		>
			<span className="mobile-btn__icon" aria-hidden="true">
				<span className="mobile-btn__inner"></span>
			</span>
			<span className="mobile-btn__label">{ translate( 'Menu' ) }</span>
		</a>
	);
};

export default MobileMenuButton;
