import { Gridicon, ExternalLink } from '@automattic/components';
import { useLocale, localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { debounce } from 'lodash';
import { useState, useEffect, useRef } from 'react';
import { isMobile, sortByMenuOrder, onLinkClick, closeOnFocusOut, isValidLink } from '../utils';
import BundlesSection from './bundles-section';
import Product from './product';
import type { MenuItem } from 'calypso/data/jetpack/use-jetpack-masterbar-data-query';
import type { FC, MouseEvent } from 'react';

interface MainMenuItemProps {
	section: MenuItem | null;
	bundles: MenuItem | null;
}

const MainMenuItem: FC< MainMenuItemProps > = ( { section, bundles } ) => {
	const locale = useLocale();
	const translate = useTranslate();
	const [ isOpen, setIsOpen ] = useState< boolean >( false );
	const submenu = useRef< HTMLDivElement >( null );

	const setSubMenuPosition = ( btn: HTMLAnchorElement, menu: HTMLDivElement ) => {
		const subMenuWrapper = menu.querySelector( '.header__submenu-wrapper' ) as HTMLElement;
		if ( ! subMenuWrapper ) {
			return;
		}

		const btnRect = btn.getBoundingClientRect();
		const btnPosition = btnRect.left;
		const isOnRightSide = window.innerWidth - btnPosition < btnPosition;

		// Handle mobile/tablet view
		if ( window.innerWidth < 1100 ) {
			if ( btn.classList.contains( 'js-menu-btn' ) ) {
				subMenuWrapper.style.margin = '0 auto';
			}
			subMenuWrapper.style.left = '0';
			return;
		}

		// Reset margin for desktop view
		subMenuWrapper.style.margin = '';

		// Calculate arrow and wrapper positions
		const offset = isOnRightSide ? 100 : 10;
		const arrowPosition = btnRect.width / 2 + offset;
		let wrapperPosition = btnPosition - offset;

		// Ensure submenu doesn't overflow viewport
		const subMenuRect = subMenuWrapper.getBoundingClientRect();
		if ( wrapperPosition + subMenuRect.width > window.innerWidth ) {
			wrapperPosition = window.innerWidth - subMenuRect.width - 20;
		}
		if ( wrapperPosition < 0 ) {
			wrapperPosition = 20;
		}

		// Apply positions
		subMenuWrapper.style.setProperty( '--arrow-left', `${ arrowPosition }px` );
		subMenuWrapper.style.left = `${ wrapperPosition }px`;
	};

	const desktopOnKeyDown = ( e: KeyboardEvent ) => {
		if ( e.key === 'Escape' ) {
			setIsOpen( false );
		}
	};

	useEffect( () => {
		document.addEventListener( 'keydown', desktopOnKeyDown );

		return () => {
			document.removeEventListener( 'keydown', desktopOnKeyDown );
		};
	}, [] );

	useEffect( () => {
		const handleResize = debounce( () => {
			const expandedBtn = document.querySelector(
				'.js-menu-btn[aria-expanded="true"]'
			) as HTMLAnchorElement;
			if ( expandedBtn && submenu.current ) {
				setSubMenuPosition( expandedBtn, submenu.current );
			}
		}, 100 );

		window.addEventListener( 'resize', handleResize );

		return () => {
			window.removeEventListener( 'resize', handleResize );
		};
	}, [ isOpen ] );

	if ( ! section ) {
		return <></>;
	}

	const toggleMenuItem = ( e?: MouseEvent< HTMLElement > ) => {
		setIsOpen( ( open ) => {
			const newIsOpen = ! open;
			if ( newIsOpen && e?.currentTarget instanceof HTMLAnchorElement ) {
				// Use the clicked button directly
				if ( submenu.current ) {
					setSubMenuPosition( e.currentTarget, submenu.current );
				}
			}
			return newIsOpen;
		} );
	};

	const onBlur = () => {
		closeOnFocusOut( submenu, isOpen, toggleMenuItem );
	};

	const onMainMenuTagClick = ( e: MouseEvent< HTMLAnchorElement > ) => {
		onLinkClick( e, 'calypso_jetpack_nav_item_click' );
	};

	const { label, id, href, items } = section;
	const hasChildren = Object.keys( items ).length > 0;
	const MainMenuTag = hasChildren ? 'a' : ExternalLink;

	return (
		<>
			<MainMenuTag
				className={ hasChildren ? 'header__menu-btn js-menu-btn' : '' }
				href={ isValidLink( href ) ? localizeUrl( href, locale ) : `#${ id }` }
				aria-expanded={ hasChildren ? isOpen : undefined }
				onClick={ isValidLink( href ) ? onMainMenuTagClick : toggleMenuItem }
				onBlur={ onBlur }
				data-target={ id }
			>
				{ label }
				{ hasChildren && <Gridicon icon="chevron-down" size={ 18 } /> }
			</MainMenuTag>
			{ hasChildren && (
				// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
				<div
					id={ id }
					className="header__submenu js-menu js"
					tabIndex={ -1 }
					hidden={ ! isOpen }
					onClick={ ! isMobile() ? toggleMenuItem : undefined }
					ref={ submenu }
				>
					<div className="header__submenu-content">
						<div className="header__submenu-wrapper">
							<button className="header__back-btn js-menu-back" onClick={ toggleMenuItem }>
								<Gridicon icon="chevron-left" size={ 18 } />
								{ translate( 'Back' ) }
							</button>
							<div className="header__submenu-category-wrapper">
								<p className="header__submenu-category-title">
									{ translate( 'Individual products' ) }
								</p>
								<ul className="header__submenu-categories-list">
									{ Array.from( Object.values( items ) )
										.sort( sortByMenuOrder )
										.map( ( { label, href, items } ) => {
											return (
												<li key={ `submenu-category-${ href }${ label }` }>
													{ isValidLink( href ) ? (
														<ExternalLink
															className="header__submenu-category header__submenu-link"
															href={ localizeUrl( href, locale ) }
															onClick={ onLinkClick }
														>
															<span className="header__submenu-label">{ label }</span>
														</ExternalLink>
													) : (
														<p className="header__submenu-category header__submenu-link">
															<span className="header__submenu-label">{ label }</span>
														</p>
													) }
													<ul className="header__submenu-links-list">
														{ Array.from( Object.values( items ) )
															.sort( sortByMenuOrder )
															.map( ( { label, href, id } ) => (
																<Product
																	key={ `products-${ href }-${ label }` }
																	product={ { label, href, id } }
																/>
															) ) }
													</ul>
												</li>
											);
										} ) }
								</ul>
							</div>
							<BundlesSection bundles={ bundles } />
						</div>
					</div>
				</div>
			) }
		</>
	);
};

export default MainMenuItem;
