import { Gridicon, ExternalLink } from '@automattic/components';
import { useLocale, localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect, useRef } from 'react';
import { isMobile, sortByMenuOrder, onLinkClick, closeOnFocusOut, isValidLink } from '../utils';
import BundlesSection from './bundles-section';
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

	const desktopOnKeyDown = ( e: KeyboardEvent ) => {
		if ( e.key === 'Escape' ) {
			setIsOpen( false );
		}
	};

	useEffect( () => {
		document.addEventListener( 'keydown', desktopOnKeyDown );

		return () => {
			document.addEventListener( 'keydown', desktopOnKeyDown );
		};
	}, [] );

	useEffect( () => {
		// Toggle scrolling based on menu state.
		document.body.style.overflow = isOpen ? 'hidden' : 'auto';

		return () => {
			// Ensure that scrolling is enabled when the component unmounts. Example where this can happen without the click action: user hits the escape key.
			document.body.style.overflow = 'auto';
		};
	}, [ isOpen ] );

	if ( ! section ) {
		return <></>;
	}

	const toggleMenuItem = () => {
		setIsOpen( ( open ) => ! open );
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
														.map( ( { label, href } ) => (
															<li key={ `submenu-${ href }${ label }` }>
																<ExternalLink
																	className="header__submenu-link"
																	href={ localizeUrl( href, locale ) }
																	onClick={ onLinkClick }
																>
																	<span className="header__submenu-label">{ label }</span>
																</ExternalLink>
															</li>
														) ) }
												</ul>
											</li>
										);
									} ) }
							</ul>
							<BundlesSection bundles={ bundles } />
						</div>
					</div>
				</div>
			) }
		</>
	);
};

export default MainMenuItem;
