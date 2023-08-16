import { useTranslate } from 'i18n-calypso';
import { useEffect, useCallback } from 'react';
import { getLastFocusableElement } from 'calypso/lib/dom/focus';
import type { MouseEvent, FC, SetStateAction, Dispatch, RefObject } from 'react';

interface MobileMenuButtonProps {
	isOpen: boolean;
	setIsOpen: Dispatch< SetStateAction< boolean > >;
	mobileMenu: RefObject< HTMLElement >;
}

const MobileMenuButton: FC< MobileMenuButtonProps > = ( { isOpen, setIsOpen, mobileMenu } ) => {
	const translate = useTranslate();

	const mobileMenuToggle = useCallback( () => {
		setIsOpen( ( open ) => ! open );

		if ( ! isOpen ) {
			document.body.classList.add( 'no-scroll' );
		} else {
			document.body.classList.remove( 'no-scroll' );
		}
	}, [ isOpen, setIsOpen ] );

	const mobileOnKeyDown = useCallback(
		( e: KeyboardEvent ) => {
			if ( e.key === 'Escape' && isOpen ) {
				mobileMenuToggle();
			}
		},
		[ mobileMenuToggle, isOpen ]
	);

	const onMobileButtonClick = ( e: MouseEvent ) => {
		e.preventDefault();

		mobileMenuToggle();
	};

	const onBlur = () => {
		const lastFocusable = getLastFocusableElement( mobileMenu.current as HTMLDivElement );

		if ( lastFocusable ) {
			lastFocusable.addEventListener(
				'focusout',
				() => {
					if ( isOpen ) {
						mobileMenuToggle();
					}
				},
				{ once: true }
			);
		}
	};

	useEffect( () => {
		document.addEventListener( 'keydown', mobileOnKeyDown );

		return () => {
			document.removeEventListener( 'keydown', mobileOnKeyDown );
		};
	}, [ mobileOnKeyDown ] );

	return (
		<a
			className="header__mobile-btn mobile-btn js-mobile-btn"
			href="#mobile-menu"
			onClick={ onMobileButtonClick }
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
