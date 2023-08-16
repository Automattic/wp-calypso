import { Gridicon } from '@automattic/components';
import { useLocale, localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState, useEffect, useRef } from 'react';
import ExternalLink from 'calypso/components/external-link';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getLastFocusableElement } from 'calypso/lib/dom/focus';
import BundlesSection from './bundles-section';
import type { MenuItem } from 'calypso/data/jetpack/use-jetpack-masterbar-data-query';
import type { FC } from 'react';

interface MainMenuItemProps {
	section: MenuItem | null;
	bundles: MenuItem | null;
}

const MainMenuItem: FC< MainMenuItemProps > = ( { section, bundles } ) => {
	const locale = useLocale();
	const translate = useTranslate();
	const [ isOpen, setIsOpen ] = useState< boolean >( false );
	const submenu = useRef< HTMLDivElement >( null );

	const isMobile = () => {
		return window.innerWidth <= 900;
	};

	const sortByMenuOrder = ( a: MenuItem, b: MenuItem ) => a.menu_order - b.menu_order;

	const onLinkClick = useCallback( ( e: React.MouseEvent< HTMLAnchorElement > ) => {
		recordTracksEvent( 'calypso_jetpack_nav_item_click', {
			nav_item: e.currentTarget
				.getAttribute( 'href' )
				// Remove the hostname https://jetpack.com/ from the href
				// (including other languages, ie. es.jetpack.com, fr.jetpack.com, etc.)
				?.replace( /https?:\/\/[a-z]{0,2}.?jetpack.com/, '' ),
		} );
	}, [] );

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

	if ( ! section ) {
		return <></>;
	}

	const isValidLink = ( url: string ) => {
		return url && url !== '#';
	};

	const toggleMenuItem = () => {
		setIsOpen( ( open ) => ! open );
	};

	const onBlur = () => {
		const lastFocusable = submenu.current
			? getLastFocusableElement( submenu.current as HTMLDivElement )
			: null;

		if ( lastFocusable ) {
			lastFocusable.addEventListener(
				'focusout',
				() => {
					if ( isOpen ) {
						toggleMenuItem();
					}
				},
				{ once: true }
			);
		}
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
				onClick={ isValidLink( href ) ? onLinkClick : toggleMenuItem }
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
