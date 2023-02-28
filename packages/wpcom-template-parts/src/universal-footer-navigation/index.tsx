/* eslint-disable no-restricted-imports */
import {
	useLocalizeUrl,
	removeLocaleFromPathLocaleInFront,
	useIsEnglishLocale,
	useLocale,
} from '@automattic/i18n-utils';
import { __ } from '@wordpress/i18n';
import SocialLogo from 'social-logos';
import useAutomatticBrandingNoun from '../hooks/use-automattic-branding-noun';
import { FooterProps } from '../types';

import './style.scss';

const UniversalNavbarFooter = ( {
	isLoggedIn = false,
	currentRoute,
	additonalCompanyLinks,
	onLanguageChange,
}: FooterProps ) => {
	const localizeUrl = useLocalizeUrl();
	const locale = useLocale();
	const isEnglishLocale = useIsEnglishLocale();
	const pathNameWithoutLocale =
		currentRoute && removeLocaleFromPathLocaleInFront( currentRoute ).slice( 1 );
	const automatticBranding = useAutomatticBrandingNoun();

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
										href={ localizeUrl( 'https://wordpress.com/p2/?ref=wpcom-product-menu' ) }
										target="_self"
									>
										{ __( 'P2: WordPress for Teams', __i18n_text_domain__ ) }
									</a>
								</li>
								<li>
									<a href="https://wpvip.com/" data-is_external="1" target="_self">
										{ __( 'Enterprise', __i18n_text_domain__ ) }{ ' ' }
										<span className="lp-link-chevron-external">
											{ __( 'Solutions', __i18n_text_domain__ ) }
										</span>
									</a>
								</li>
								<li>
									<a
										href={ localizeUrl( 'https://wordpress.com/do-it-for-me/?ref=footer_pricing' ) }
										title="WordPress Website Building Service"
										target="_self"
									>
										{ __( 'Built by WordPress.com', __i18n_text_domain__ ) }
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
									<a href={ localizeUrl( 'https://wordpress.com/webinars/' ) } target="_self">
										{ __( 'Daily Webinars', __i18n_text_domain__ ) }
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
										{ __( 'Developer', __i18n_text_domain__ ) }{ ' ' }
										<span className="lp-link-chevron-external">
											{ __( 'Resources', __i18n_text_domain__ ) }
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
									<a href="https://automattic.com/privacy/" data-is_external="1">
										{ __( 'Privacy', __i18n_text_domain__ ) }{ ' ' }
										<span className="lp-link-chevron-external">
											{ __( 'Policy', __i18n_text_domain__ ) }
										</span>
									</a>
								</li>
								{ additonalCompanyLinks }
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
									defaultValue={ currentRoute }
								>
									<option>{ __( 'Change Language', __i18n_text_domain__ ) }</option>
									<option lang="es" value={ `/es/${ pathNameWithoutLocale }` }>
										Español
									</option>
									<option lang="pt-br" value={ `/pt-br/${ pathNameWithoutLocale }` }>
										Português do Brasil
									</option>
									<option lang="de" value={ `/de/${ pathNameWithoutLocale }` }>
										Deutsch
									</option>
									<option lang="fr" value={ `/fr/${ pathNameWithoutLocale }` }>
										Français
									</option>
									<option lang="he" value={ `/he/${ pathNameWithoutLocale }` }>
										עִבְרִית
									</option>
									<option lang="ja" value={ `/ja/${ pathNameWithoutLocale }` }>
										日本語
									</option>
									<option lang="it" value={ `/it/${ pathNameWithoutLocale }` }>
										Italiano
									</option>
									<option lang="nl" value={ `/nl/${ pathNameWithoutLocale }` }>
										Nederlands
									</option>
									<option lang="ru" value={ `/ru/${ pathNameWithoutLocale }` }>
										Русский
									</option>
									<option lang="tr" value={ `/tr/${ pathNameWithoutLocale }` }>
										Türkçe
									</option>
									<option lang="id" value={ `/id/${ pathNameWithoutLocale }` }>
										Bahasa Indonesia
									</option>
									<option lang="zh-cn" value={ `/zh-cn/${ pathNameWithoutLocale }` }>
										简体中文
									</option>
									<option lang="zh-tw" value={ `/zh-tw/${ pathNameWithoutLocale }` }>
										繁體中文
									</option>
									<option lang="ko" value={ `/ko/${ pathNameWithoutLocale }` }>
										한국어
									</option>
									<option lang="ar" value={ `/ar/${ pathNameWithoutLocale }` }>
										العربية
									</option>
									<option lang="sv" value={ `/sv/${ pathNameWithoutLocale }` }>
										Svenska
									</option>
									<option lang="el" value={ `/el/${ pathNameWithoutLocale }` }>
										Ελληνικά
									</option>
									<option lang="en" value={ `/${ pathNameWithoutLocale }` }>
										English
									</option>
									<option lang="ro" value={ `/ro/${ pathNameWithoutLocale }` }>
										Română
									</option>
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
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 23 25"
												aria-hidden="true"
											>
												<defs>
													<linearGradient id="lp-gp-a" x1="50%" x2="40%" y1="25%" y2="50%">
														<stop offset="0%" stopColor="#00c4ff"></stop>
														<stop offset="100%" stopColor="#00e3ff"></stop>
													</linearGradient>
													<linearGradient id="lp-gp-b" x1="0%" x2="100%" y1="50%" y2="50%">
														<stop offset="0%" stopColor="#fb0"></stop>
														<stop offset="100%" stopColor="#fd0"></stop>
													</linearGradient>
													<linearGradient id="lp-gp-c" x1="100%" x2="0%" y1="20%" y2="80%">
														<stop offset="0%" stopColor="#df2454"></stop>
														<stop offset="100%" stopColor="#ff3a44"></stop>
													</linearGradient>
													<linearGradient id="lp-gp-d" x1="0%" x2="100%" y1="20%" y2="80%">
														<stop offset="0%" stopColor="#13d375"></stop>
														<stop offset="100%" stopColor="#00f076"></stop>
													</linearGradient>
												</defs>
												<path
													fill="url(#lp-gp-a)"
													d="M.44.38C.16.68 0 1.15 0 1.75v21.48c0 .6.16 1.07.45 1.36l.08.07 12.03-12.04v-.26L.52.32.44.38z"
												></path>
												<path
													fill="url(#lp-gp-b)"
													d="m16.57 16.65-4.02-4.02v-.28l4.02-4.01.08.05 4.75 2.7c1.36.77 1.36 2.03 0 2.8l-4.74 2.7-.1.06z"
												></path>
												<path
													fill="url(#lp-gp-c)"
													d="m16.66 16.6-4.1-4.1L.43 24.6c.45.48 1.19.53 2.02.07l14.2-8.08"
												></path>
												<path
													fill="url(#lp-gp-d)"
													d="M16.66 8.4 2.46.32C1.63-.15.88-.08.44.4l12.11 12.1 4.1-4.1z"
												></path>
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
						{ automatticBranding.article }
						<span className="lp-hidden">Automattic</span>
						<svg
							className="lp-icon lp-icon--custom-automattic-footer"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 126 11"
							aria-hidden="true"
						>
							<path d="M121 .68c1.9 0 3.62.82 4.55 1.86l-1.05 1.1c-.81-.77-2-1.5-3.6-1.5-2.4 0-3.75 1.71-3.75 3.48v.19c0 1.76 1.36 3.4 3.87 3.4 1.5 0 2.74-.74 3.52-1.5l1.01 1.11a6.58 6.58 0 0 1-4.64 1.86c-3.4 0-5.46-2.29-5.46-4.8v-.31c0-2.52 2.25-4.89 5.54-4.89zm-104.64.34v5.46c0 1.71 1.09 2.73 3.17 2.73 2.13 0 3-1.02 3-2.73V1.02h1.69v5.43c0 2.3-1.43 4.23-4.82 4.23-3.22 0-4.72-1.82-4.72-4.23V1h1.68zM45.88.68c3.2 0 5.25 2.33 5.25 4.85v.3c0 2.48-2.06 4.85-5.26 4.85-3.18 0-5.24-2.37-5.24-4.85v-.3C40.63 3 42.69.68 45.88.68zm-8.35.34v1.45H33.6v7.85h-1.68V2.47h-3.93V1.02h9.54zm20.12 0 3.54 6.38.42.78.42-.78 3.5-6.4h2.31v9.3h-1.68V2.97l-.45.8-3.76 6.56h-.82L57.4 3.77l-.45-.81v7.36h-1.64v-9.3h2.33zm35.47 0v1.45h-3.93v7.85h-1.68V2.47h-3.93V1.02h9.54zm12.36 0v1.45h-3.92v7.85h-1.69V2.47h-3.92V1.02h9.53zm5.82 0v9.3h-1.66V1.89c.67 0 .94-.37.94-.88h.72zm-104.5 0 4.94 9.3h-1.8l-1.19-2.3H3.48l-1.15 2.3H.55l4.86-9.3h1.4zm70.66 0 4.93 9.3h-1.8l-1.19-2.3h-5.27l-1.15 2.3H71.2l4.86-9.3h1.4zM45.88 2.15c-2.3 0-3.55 1.6-3.55 3.4v.23c0 1.8 1.25 3.43 3.55 3.43 2.29 0 3.56-1.63 3.56-3.43v-.23c0-1.8-1.27-3.4-3.56-3.4zm1.1 1.77a.7.7 0 0 1 .2.94l-1.54 2.46a.64.64 0 0 1-.9.2.7.7 0 0 1-.2-.93l1.54-2.47a.64.64 0 0 1 .9-.2zM6.08 2.83 4.1 6.74h3.98l-2.02-3.9zm70.65 0-1.96 3.91h3.98l-2.02-3.9z"></path>
						</svg>
						{ automatticBranding.noun }
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

export default UniversalNavbarFooter;
