/* eslint-disable no-restricted-imports */
import {
	localizeUrl as pureLocalizeUrl,
	removeLocaleFromPathLocaleInFront,
	useIsEnglishLocale,
	useLocale,
	useLocalizeUrl,
} from '@automattic/i18n-utils';
import { __ } from '@wordpress/i18n';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useLayoutEffect, useState } from 'react';
import { SocialLogo } from 'social-logos';
import { AutomatticBrand, getAutomatticBrandingNoun } from '../utils';
import type { FooterProps, PureFooterProps, LanguageOptions } from '../types';

import './style.scss';

const useIsomorphicEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const defaultOnLanguageChange: React.ChangeEventHandler< HTMLSelectElement > = ( event ) => {
	const pathWithoutLocale = removeLocaleFromPathLocaleInFront( window.location.pathname );

	window.location.href = `/${ event.target.value }${ pathWithoutLocale }`;
};

const allLanguageOptions: LanguageOptions = {
	en: 'English',
	de: 'Deutsch',
	es: 'Español',
	fr: 'Français',
	id: 'Bahasa Indonesia',
	it: 'Italiano',
	nl: 'Nederlands',
	'pt-br': 'Português do Brasil',
	ro: 'Română',
	sv: 'Svenska',
	tr: 'Türkçe',
	ru: 'Русский',
	el: 'Ελληνικά',
	ar: 'العربية',
	he: 'עִבְרִית',
	ja: '日本語',
	ko: '한국어',
	'zh-cn': '简体中文',
	'zh-tw': '繁體中文',
} as const;

const normalizedLocales: Record< string, keyof typeof allLanguageOptions > = {
	'zh-Hans': 'zh-cn',
	'zh-Hant': 'zh-tw',
} as const;

/**
 * This component doesn't depend on any hooks or state. This makes it Gutenberg save.js friendly.
 */
export const PureUniversalNavbarFooter = ( {
	isLoggedIn = typeof window !== 'undefined'
		? document.body.classList.contains( 'logged-in' )
		: false,
	additionalCompanyLinks = null,
	onLanguageChange = defaultOnLanguageChange,
	localizeUrl = pureLocalizeUrl,
	automatticBranding,
	locale,
	languageOptions = allLanguageOptions,
}: PureFooterProps ) => {
	const isEnglishLocale = locale === 'en';

	const languageEntries = Object.entries( languageOptions );

	return (
		<>
			<section
				id="lpc-footer-nav"
				data-vars-ev-id="lpc-footer-nav"
				className="lpc lpc-footer-nav"
				data-vars-ev-classname="lpc lpc-footer-nav"
			>
				<h2 className="lp-hidden">WordPress.com</h2>
				<div className="lpc-footer-nav-wrapper">
					<div className="lpc-footer-nav-container">
						<div>
							<h3>{ __( 'Products', __i18n_text_domain__ ) }</h3>
							<ul>
								<li>
									<a href={ localizeUrl( 'https://wordpress.com/hosting/' ) } target="_self">
										{ __( 'WordPress Hosting', __i18n_text_domain__ ) }
									</a>
								</li>
								<li>
									<a href={ localizeUrl( 'https://wordpress.com/domains/' ) } target="_self">
										{ __( 'Domain Names', __i18n_text_domain__ ) }
									</a>
								</li>
								<li>
									<a
										href={ localizeUrl( 'https://wordpress.com/ai-website-builder/?ref=footer' ) }
										target="_self"
									>
										{ __( 'AI Website Builder', __i18n_text_domain__ ) }
									</a>
								</li>
								<li>
									<a
										href={ localizeUrl( 'https://wordpress.com/website-builder/' ) }
										target="_self"
									>
										{ __( 'Website Builder', __i18n_text_domain__ ) }
									</a>
								</li>
								<li>
									<a href={ localizeUrl( 'https://wordpress.com/create-blog/' ) } target="_self">
										{ __( 'Create a Blog', __i18n_text_domain__ ) }
									</a>
								</li>
								<li>
									<a
										href={ localizeUrl( 'https://wordpress.com/professional-email/' ) }
										target="_self"
									>
										{ __( 'Professional Email', __i18n_text_domain__ ) }
									</a>
								</li>
								<li>
									<a
										href={ localizeUrl(
											'https://wordpress.com/website-design-service/?ref=footer_pricing'
										) }
										title="WordPress Website Building Service"
										target="_self"
									>
										{ __( 'Website Design Services', __i18n_text_domain__ ) }
									</a>
								</li>
								<li>
									<a href="https://wpvip.com/" data-is_external="1" target="_self">
										<span className="lp-link-chevron-external">
											{ __( 'Enterprise', __i18n_text_domain__ ) }
										</span>
									</a>
								</li>
							</ul>
						</div>
						<div>
							<h3>{ __( 'Features', __i18n_text_domain__ ) }</h3>
							<ul>
								<li>
									<a
										href={ localizeUrl( 'https://wordpress.com/features/' ) }
										title="WordPress.com Features"
										target="_self"
									>
										{ __( 'Overview', __i18n_text_domain__ ) }
									</a>
								</li>
								<li>
									<a
										href={ localizeUrl( 'https://wordpress.com/themes', locale, isLoggedIn ) }
										target="_self"
									>
										{ __( 'WordPress Themes', __i18n_text_domain__ ) }
									</a>
								</li>
								<li>
									<a
										href={ localizeUrl( 'https://wordpress.com/plugins/', locale, isLoggedIn ) }
										target="_self"
									>
										{ __( 'WordPress Plugins', __i18n_text_domain__ ) }
									</a>
								</li>
								<li>
									<a
										href={ localizeUrl( 'https://wordpress.com/patterns/', locale, isLoggedIn ) }
										target="_self"
									>
										{ __( 'WordPress Patterns', __i18n_text_domain__ ) }
									</a>
								</li>
								<li>
									<a href={ localizeUrl( 'https://wordpress.com/google/' ) } target="_self">
										{ __( 'Google Apps', __i18n_text_domain__ ) }
									</a>
								</li>
							</ul>
						</div>
						<div>
							<h3>{ __( 'Resources', __i18n_text_domain__ ) }</h3>
							<ul>
								<li>
									<a href={ localizeUrl( 'https://wordpress.com/support/' ) } target="_self">
										{ __( 'WordPress.com Support', __i18n_text_domain__ ) }
									</a>
								</li>
								<li>
									<a href={ localizeUrl( 'https://wordpress.com/forums/' ) } target="_self">
										{ __( 'WordPress Forums', __i18n_text_domain__ ) }
									</a>
								</li>
								<li>
									<a href={ localizeUrl( 'https://wordpress.com/blog/' ) } target="_self">
										{ __( 'WordPress News', __i18n_text_domain__ ) }
									</a>
								</li>
								<li>
									<a href={ localizeUrl( 'https://wordpress.com/go/' ) } target="_self">
										{ __( 'Website Building Tips', __i18n_text_domain__ ) }
									</a>
								</li>
								<li>
									<a
										href={ localizeUrl( 'https://wordpress.com/business-name-generator/' ) }
										target="_self"
									>
										{ __( 'Business Name Generator', __i18n_text_domain__ ) }
									</a>
								</li>
								<li>
									<a href={ localizeUrl( 'https://wordpress.com/logo-maker/' ) } target="_self">
										{ __( 'Logo Maker', __i18n_text_domain__ ) }
									</a>
								</li>
								<li>
									<a href={ localizeUrl( 'https://wordpress.com/discover/' ) } target="_self">
										{ __( 'Discover New Posts', __i18n_text_domain__ ) }
									</a>
								</li>
								<li>
									<a href={ localizeUrl( 'https://wordpress.com/tags/' ) } target="_self">
										{ __( 'Popular Tags', __i18n_text_domain__ ) }
									</a>
								</li>
								<li>
									<a href={ localizeUrl( 'https://wordpress.com/reader/search/' ) } target="_self">
										{ __( 'Blog Search', __i18n_text_domain__ ) }
									</a>
								</li>
								<li>
									{ isEnglishLocale && (
										<a href={ localizeUrl( 'https://wordpress.com/learn/' ) } target="_self">
											{ __( 'Learn WordPress', __i18n_text_domain__ ) }
										</a>
									) }
								</li>
								<li>
									<a
										href={ localizeUrl( 'https://developer.wordpress.com/' ) }
										data-is_external="1"
									>
										<span className="lp-link-chevron-external">
											{ __( 'Developer Resources', __i18n_text_domain__ ) }
										</span>
									</a>
								</li>
							</ul>
						</div>
						<div>
							<h3>{ __( 'Company', __i18n_text_domain__ ) }</h3>
							<ul>
								<li>
									<a href={ localizeUrl( 'https://wordpress.com/about/' ) } target="_self">
										{ __( 'About', __i18n_text_domain__ ) }
									</a>
								</li>
								<li>
									<a href={ localizeUrl( 'https://wordpress.com/partners/' ) } target="_self">
										{ __( 'Partners', __i18n_text_domain__ ) }
									</a>
								</li>
								<li>
									<a href="https://automattic.com/press/" data-is_external="1">
										<span className="lp-link-chevron-external">
											{ __( 'Press', __i18n_text_domain__ ) }
										</span>
									</a>
								</li>
								<li>
									<a href={ localizeUrl( 'https://wordpress.com/tos/' ) } target="_self">
										{ __( 'Terms of Service', __i18n_text_domain__ ) }
									</a>
								</li>
								<li>
									<a href={ localizeUrl( 'https://automattic.com/privacy/' ) } data-is_external="1">
										<span className="lp-link-chevron-external">
											{ __( 'Privacy Policy', __i18n_text_domain__ ) }
										</span>
									</a>
								</li>
								{ additionalCompanyLinks }
							</ul>
						</div>
					</div>
					<div className="lpc-footer-subnav-container">
						<div className="lp-footer-language">
							<h2 className="lp-hidden">{ __( 'Language', __i18n_text_domain__ ) }</h2>
							<div className="lp-language-picker">
								<div className="lp-language-picker__icon"></div>
								<div className="lp-language-picker__chevron"></div>
								<select
									className="lp-language-picker__content"
									title={ __( 'Change Language', __i18n_text_domain__ ) }
									onChange={ onLanguageChange }
									defaultValue={ `/${ locale }` }
								>
									<option>{ __( 'Change Language', __i18n_text_domain__ ) }</option>
									{ languageEntries.map( ( option ) => {
										const locale = option[ 0 ];
										return (
											<option key={ locale } lang={ locale } value={ locale }>
												{ allLanguageOptions[ locale ] ||
													allLanguageOptions[ normalizedLocales[ locale ] ] }
											</option>
										);
									} ) }
								</select>
							</div>
						</div>
						<div className="lpc-footer-mobile-apps">
							<h2 className="lp-hidden">{ __( 'Mobile Apps', __i18n_text_domain__ ) }</h2>
							<ul className="lp-footer-mobile-icons">
								<li>
									<a
										className="lp-app-button lp-app-button--type-google-play"
										href="https://play.google.com/store/apps/details?id=org.wordpress.android"
									>
										<span className="lp-app-button__content">
											<svg
												className="lp-app-button__content--icon"
												width="23"
												viewBox="0 0 28.99 31.99"
												xmlns="http://www.w3.org/2000/svg"
												aria-hidden="true"
											>
												<path
													d="M13.54 15.28.12 29.34a3.66 3.66 0 0 0 5.33 2.16l15.1-8.6Z"
													fill="#ea4335"
												/>
												<path
													d="m27.11 12.89-6.53-3.74-7.35 6.45 7.38 7.28 6.48-3.7a3.54 3.54 0 0 0 1.5-4.79 3.62 3.62 0 0 0-1.5-1.5z"
													fill="#fbbc04"
												/>
												<path
													d="M.12 2.66a3.57 3.57 0 0 0-.12.92v24.84a3.57 3.57 0 0 0 .12.92L14 15.64Z"
													fill="#4285f4"
												/>
												<path
													d="m13.64 16 6.94-6.85L5.5.51A3.73 3.73 0 0 0 3.63 0 3.64 3.64 0 0 0 .12 2.65Z"
													fill="#34a853"
												/>
											</svg>
											<span className="lp-app-button__content--label">
												<span className="lp-app-button__line lp-app-button__line--top">
													{ __( 'Get it on', __i18n_text_domain__ ) }
												</span>
												<span className="lp-app-button__line lp-app-button__line--bottom">
													Google Play
												</span>
											</span>
										</span>
									</a>
								</li>
								<li>
									<a
										className="lp-app-button lp-app-button--type-app-store"
										href="https://apps.apple.com/us/app/wordpress/id335703880"
									>
										<span className="lp-app-button__content">
											<svg
												className="lp-app-button__content--icon"
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 18 23"
												aria-hidden="true"
											>
												<path
													fill="#fff"
													d="m12.88 5.97.28.02c1.6.05 3.08.85 4 2.16a4.95 4.95 0 0 0-2.36 4.15 4.78 4.78 0 0 0 2.92 4.4 10.96 10.96 0 0 1-1.52 3.1c-.9 1.33-1.83 2.64-3.32 2.66-1.45.04-1.94-.85-3.6-.85-1.67 0-2.19.83-3.57.89-1.42.05-2.5-1.43-3.43-2.76-1.85-2.7-3.3-7.63-1.36-10.97a5.32 5.32 0 0 1 4.47-2.73C6.81 6 8.13 7 9 7c.86 0 2.48-1.18 4.16-1zm.3-5.25a4.87 4.87 0 0 1-1.11 3.49 4.1 4.1 0 0 1-3.24 1.53 4.64 4.64 0 0 1 1.14-3.36A4.96 4.96 0 0 1 13.18.72z"
												></path>
											</svg>
											<span className="lp-app-button__content--label">
												<span className="lp-app-button__line lp-app-button__line--top">
													{ __( 'Download on the', __i18n_text_domain__ ) }
												</span>
												<span className="lp-app-button__line lp-app-button__line--bottom">
													App Store
												</span>
											</span>
										</span>
									</a>
								</li>
							</ul>
						</div>

						<div className="lp-footer-social-media">
							<h2 className="lp-hidden">{ __( 'Social Media', __i18n_text_domain__ ) }</h2>
							<ul className="lp-footer-social-icons">
								<li>
									<a href="https://twitter.com/wordpressdotcom" title="WordPress.com on Twitter">
										<span className="lp-hidden">
											{ __( 'WordPress.com on Twitter', __i18n_text_domain__ ) }
										</span>
										<SocialLogo size={ 24 } icon="twitter-alt" className="lp-icon" />
									</a>
								</li>
								<li>
									<a
										href="https://www.facebook.com/WordPresscom/"
										title="WordPress.com on Facebook"
									>
										<span className="lp-hidden">
											{ __( 'WordPress.com on Facebook', __i18n_text_domain__ ) }
										</span>
										<SocialLogo size={ 24 } icon="facebook" className="lp-icon" />
									</a>
								</li>
								<li>
									<a
										href="https://www.instagram.com/wordpressdotcom/"
										title="WordPress.com on Instagram"
									>
										<span className="lp-hidden">
											{ __( 'WordPress.com on Instagram', __i18n_text_domain__ ) }
										</span>
										<SocialLogo size={ 24 } icon="instagram" className="lp-icon" />
									</a>
								</li>
								<li>
									<a
										href="https://www.youtube.com/WordPressdotcom"
										title="WordPress.com on YouTube"
									>
										<span className="lp-hidden">
											{ __( 'WordPress.com on YouTube', __i18n_text_domain__ ) }
										</span>
										<SocialLogo size={ 24 } icon="youtube" className="lp-icon" />
									</a>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</section>
			<div className="lpc-footer-automattic-nav">
				<div className="lpc-footer-automattic-nav-wrapper">
					<a className="lp-logo-label" href="https://automattic.com/">
						{ automatticBranding }
					</a>
					<div className="lp-logo-label-spacer"></div>
					<a className="lp-link-work" href="https://automattic.com/work-with-us/">
						<span className="lp-link-chevron-external">
							{ __( 'Work With Us', __i18n_text_domain__ ) }
						</span>
					</a>
				</div>
				<a className="lp-link-work-m" href="https://automattic.com/work-with-us/">
					<span className="lp-link-chevron-external">
						{ __( 'Work With Us', __i18n_text_domain__ ) }
					</span>
				</a>
			</div>
		</>
	);
};

const UniversalNavbarFooter = ( {
	isLoggedIn = false,
	currentRoute,
	additionalCompanyLinks,
	onLanguageChange,
}: FooterProps ) => {
	const localizeUrl = useLocalizeUrl();
	const locale = useLocale();
	const translate = useTranslate();
	const isEnglishLocale = useIsEnglishLocale();
	const pathNameWithoutLocale =
		currentRoute && removeLocaleFromPathLocaleInFront( currentRoute ).slice( 1 );
	const [ automatticBranding, setAutomatticBranding ] = useState<
		React.ReactElement | string | number
	>( <AutomatticBrand /> );

	// Since this component renders in SSR, effects don't run there. As a result,
	// the markup needs to look ok _before_ any effects run. Using the isomorphic
	// effect allows us to do nothing on the server, but run the layout effect
	// on the client to provide the random branding strings as a bonus. This only
	// works because the default (no random branding) also looks fine (it just
	// shows the Automattic logo.)
	useIsomorphicEffect( () => {
		setAutomatticBranding( getAutomatticBrandingNoun( translate ) );
	}, [ translate ] );

	return (
		<PureUniversalNavbarFooter
			locale={ locale }
			isEnglishLocale={ isEnglishLocale }
			automatticBranding={ automatticBranding }
			isLoggedIn={ isLoggedIn }
			currentRoute={ pathNameWithoutLocale }
			additionalCompanyLinks={ additionalCompanyLinks }
			onLanguageChange={ onLanguageChange }
			localizeUrl={ localizeUrl }
		/>
	);
};

export default UniversalNavbarFooter;
