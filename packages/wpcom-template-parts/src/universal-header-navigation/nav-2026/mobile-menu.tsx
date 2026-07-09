import { WordPressWordmark } from '@automattic/components';
import clsx from 'clsx';
import React from 'react';
import { ClickableItem } from '../menu-items';
import { Nav2026AppBanner } from './app-banner';
import type { Nav2026Menu } from './types';

// Mystery-person Gravatar fallback for the mobile footer avatar.
const DEFAULT_AVATAR_URL = 'https://www.gravatar.com/avatar/?d=mp&s=96';

type LocalizeUrl = (
	fullUrl: string,
	locale?: string,
	isLoggedIn?: boolean,
	useEnglishUrl?: boolean
) => string;

type Translate = ( text: string, domain?: string ) => string;

interface Nav2026MobileMenuProps {
	isMobileMenuOpen: boolean;
	isMenuOpening: boolean;
	activeCategory: Nav2026Menu | undefined;
	nav2026Menus: Nav2026Menu[];
	isLoggedIn: boolean;
	mobileMenuTabIndex: number | undefined;
	logoColor: string | undefined;
	userAvatar: string | undefined;
	userName: string | undefined;
	userEmail: string | undefined;
	localizeUrl: LocalizeUrl;
	locale: string;
	startUrl: string;
	loginUrl: string | undefined;
	__: Translate;
	variant: 'default' | 'minimal';
	mobilePlatform: 'ios' | 'android' | null;
	mobileFooterRef: React.RefObject< HTMLDivElement | null >;
	closeMobileMenu: ( reason: string ) => void;
	setCurrentDropdown: ( name: string | null ) => void;
}

export function Nav2026MobileMenu( {
	isMobileMenuOpen,
	isMenuOpening,
	activeCategory,
	nav2026Menus,
	isLoggedIn,
	mobileMenuTabIndex,
	logoColor,
	userAvatar,
	userName,
	userEmail,
	localizeUrl,
	locale,
	startUrl,
	loginUrl,
	__,
	variant,
	mobilePlatform,
	mobileFooterRef,
	closeMobileMenu,
	setCurrentDropdown,
}: Nav2026MobileMenuProps ) {
	return (
		<div
			id="x-mobile-menu-2026"
			className={ clsx( 'x-menu x-menu--2026', {
				'x-menu__active x-menu__open': isMobileMenuOpen,
				'is-opening': isMenuOpening,
			} ) }
			role="dialog"
			aria-modal="true"
			aria-label={ __( 'WordPress.com Navigation Menu', __i18n_text_domain__ ) }
			aria-hidden={ ! isMobileMenuOpen }
		>
			{ /* eslint-disable-next-line jsx-a11y/no-static-element-interactions */ }
			<div
				className="x-menu-overlay"
				onKeyDown={ () => closeMobileMenu( 'overlay' ) }
				onClick={ () => closeMobileMenu( 'overlay' ) }
			/>
			<div className="x-menu-content">
				<div className="x-menu-mobile-main">
					{ /* Sticky header; inside the scroller so it stickies as the list scrolls. */ }
					<div className="x-menu-mobile-header">
						<div className="x-menu-mobile-header-top">
							<a
								className={ clsx( 'x-menu-mobile-logo x-link', {
									'is-hidden': !! activeCategory,
								} ) }
								href={ localizeUrl( '//wordpress.com' ) }
								target="_self"
								tabIndex={ mobileMenuTabIndex }
							>
								<WordPressWordmark
									className="x-icon x-icon__logo"
									color={ logoColor ?? 'var(--studio-blue-50)' }
									size={ { width: 170, height: 36 } }
								/>
								<span className="x-hidden">WordPress.com</span>
							</a>
							<button
								type="button"
								className={ clsx( 'x-menu-mobile-back x-link', {
									'is-hidden': ! activeCategory,
								} ) }
								onClick={ () => setCurrentDropdown( null ) }
								tabIndex={ mobileMenuTabIndex }
							>
								<span className="x-menu-mobile-back-chevron" aria-hidden="true" />
								{ __( 'Back', __i18n_text_domain__ ) }
							</button>
							<button
								type="button"
								className="x-menu-button x-menu-mobile-close x-link"
								onClick={ () => closeMobileMenu( 'close_button' ) }
								tabIndex={ mobileMenuTabIndex }
							>
								<span className="x-hidden">{ __( 'Close menu', __i18n_text_domain__ ) }</span>
								<span className="x-icon x-icon__close">
									<span></span>
									<span></span>
								</span>
							</button>
						</div>
						<h4
							className={ clsx( 'x-menu-mobile-category-title', {
								'is-visible': !! activeCategory,
							} ) }
						>
							{ activeCategory?.title }
						</h4>
					</div>
					{ variant !== 'minimal' && (
						<>
							<ul
								className={ clsx( 'x-menu-mobile-nav-list', {
									'is-hidden': !! activeCategory,
								} ) }
							>
								{ nav2026Menus.map( ( menu, index ) => (
									<li
										className="x-menu-mobile-nav-item"
										role="none"
										key={ menu.name }
										style={ { '--stagger-index': index } as React.CSSProperties }
									>
										{ menu.groups ? (
											<button
												className="x-menu-mobile-nav-link x-link"
												onClick={ () => setCurrentDropdown( menu.name ) }
												tabIndex={ mobileMenuTabIndex }
											>
												{ menu.title }
												<span className="x-menu-mobile-nav-chevron" aria-hidden="true" />
											</button>
										) : (
											<ClickableItem
												titleValue=""
												content={ menu.title }
												urlValue={ menu.href }
												type="menu"
												typeClassName="x-menu-mobile-nav-link x-link"
												tabIndex={ mobileMenuTabIndex }
											/>
										) }
									</li>
								) ) }
							</ul>
							{ nav2026Menus
								.filter( ( menu ) => menu.groups )
								.flatMap( ( menu ) => {
									const isActive = activeCategory?.name === menu.name;
									// One flat list per group; the active category's lists toggle `.is-visible` together.
									return ( menu.groups ?? [] ).map( ( group, groupIndex ) => (
										<ul
											className={ clsx( 'x-menu-mobile-dropdown-list', {
												'is-visible': isActive,
											} ) }
											data-dropdown-name={ menu.name }
											key={ `${ menu.name }-${ group.title }` }
										>
											<li className="x-menu-mobile-dropdown-subtitle" role="presentation">
												{ group.title }
											</li>
											{ group.items.map( ( item, itemIndex ) => (
												<li
													className="x-menu-mobile-dropdown-item"
													role="none"
													key={ item.url }
													style={
														{
															'--stagger-index': groupIndex * 4 + itemIndex,
														} as React.CSSProperties
													}
												>
													<ClickableItem
														titleValue=""
														content={
															item.badge ? (
																<>
																	{ item.label }
																	<span className="x-menu-mobile-dropdown-badge-new">
																		{ item.badge }
																	</span>
																</>
															) : (
																item.label
															)
														}
														urlValue={ item.url }
														type="menu"
														typeClassName="x-menu-mobile-dropdown-link x-link"
														trackingText={ item.label }
														target={ item.target }
														tabIndex={ isActive ? mobileMenuTabIndex : -1 }
													/>
												</li>
											) ) }
										</ul>
									) );
								} ) }
						</>
					) }
				</div>
				<div className="x-menu-mobile-footer" ref={ mobileFooterRef }>
					{ /* Top-level screen only; hidden while a category is drilled into. */ }
					<Nav2026AppBanner
						mobilePlatform={ mobilePlatform }
						isHidden={ !! activeCategory }
						tabIndex={ mobileMenuTabIndex }
						localizeUrl={ localizeUrl }
						__={ __ }
					/>
					{ isLoggedIn ? (
						<a
							className="x-menu-mobile-user x-link"
							href={ localizeUrl( '//wordpress.com/me' ) }
							target="_self"
							tabIndex={ mobileMenuTabIndex }
						>
							<img
								className="x-menu-mobile-user-avatar"
								src={ userAvatar || DEFAULT_AVATAR_URL }
								alt=""
								width={ 40 }
								height={ 40 }
							/>
							<span className="x-menu-mobile-user-details">
								<span className="x-menu-mobile-user-name">
									{ userName || __( 'My Profile', __i18n_text_domain__ ) }
								</span>
								{ userEmail && <span className="x-menu-mobile-user-email">{ userEmail }</span> }
							</span>
						</a>
					) : (
						<ul className="x-menu-mobile-footer-actions">
							<ClickableItem
								titleValue=""
								content={ __( 'Log in', __i18n_text_domain__ ) }
								urlValue={
									loginUrl || localizeUrl( '//wordpress.com/log-in', locale, isLoggedIn, true )
								}
								type="menu"
								typeClassName="x-menu-link x-link x-menu-mobile-login"
								tabIndex={ mobileMenuTabIndex }
							/>
							<ClickableItem
								titleValue=""
								content={ __( 'Get started', __i18n_text_domain__ ) }
								urlValue={ startUrl }
								type="menu"
								typeClassName="x-menu-link x-link x-menu-mobile-get-started cta-btn-nav"
								tabIndex={ mobileMenuTabIndex }
							/>
						</ul>
					) }
				</div>
			</div>
		</div>
	);
}
