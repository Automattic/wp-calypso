import './style.scss';
import { getUrlParts } from '@automattic/calypso-url';
import { getPathParts, getLanguage } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import SocialLogo from 'calypso/components/social-logo';
import { navigate } from 'calypso/lib/navigate';

function getRealPathName( path: string ) {
	const urlParts = getUrlParts( path );
	const locale = getPathParts( urlParts.pathname ).shift();
	return 'undefined' === typeof getLanguage( locale ) ? path : path.replace( `${ locale }/`, '' );
}

const UniversalNavbarFooter = () => {
	const translate = useTranslate();
	const realPathName = getRealPathName( window.location.pathname.slice( 1 ) );

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
							<h3>{ translate( 'Products' ) }</h3>
							<ul>
								<li>
									<a href="https://wordpress.com/hosting/">{ translate( 'WordPress Hosting' ) }</a>
								</li>
								<li>
									<a href="https://wordpress.com/domains/">{ translate( 'Domain Names' ) }</a>
								</li>
								<li>
									<a href="https://wordpress.com/website-builder/">
										{ translate( 'Website Builder' ) }
									</a>
								</li>
								<li>
									<a href="https://wordpress.com/create-blog/">{ translate( 'Create a Blog' ) }</a>
								</li>
								<li>
									<a href="https://wordpress.com/professional-email/">
										{ translate( 'Professional Email' ) }
									</a>
								</li>
								<li>
									<a href="https://wordpress.com/p2/?ref=wpcom-product-menu">
										{ translate( 'P2: WordPress for Teams' ) }
									</a>
								</li>
								<li>
									<a href="https://wpvip.com/" data-is_external="1">
										{ translate( 'Enterprise' ) }{ ' ' }
										<span className="lp-link-chevron-external">{ translate( 'Solutions' ) }</span>
									</a>
								</li>
								<li>
									<a
										href="https://wordpress.com/do-it-for-me/?ref=footer_pricing"
										title="WordPress Website Building Service"
									>
										{ translate( 'Built by WordPress.com' ) }
									</a>
								</li>
							</ul>
						</div>
						<div>
							<h3>{ translate( 'Features' ) }</h3>
							<ul>
								<li>
									<a href="https://wordpress.com/features/" title="WordPress.com Features">
										{ translate( 'Overview' ) }
									</a>
								</li>
								<li>
									<a href="https://wordpress.com/themes">{ translate( 'WordPress Themes' ) }</a>
								</li>
								<li>
									<a href="https://wordpress.com/install-plugins/">
										{ translate( 'WordPress Plugins' ) }
									</a>
								</li>
								<li>
									<a href="https://wordpress.com/google/">{ translate( 'Google Apps' ) }</a>
								</li>
							</ul>
						</div>
						<div>
							<h3>{ translate( 'Resources' ) }</h3>
							<ul>
								<li>
									<a href="https://wordpress.com/support/">
										{ translate( 'WordPress.com Support' ) }
									</a>
								</li>
								<li>
									<a href="https://wordpress.com/forums/">{ translate( 'WordPress Forums' ) }</a>
								</li>
								<li>
									<a href="https://wordpress.com/blog/">{ translate( 'WordPress News' ) }</a>
								</li>
								<li>
									<a href="https://wordpress.com/go/">{ translate( 'Website Building Tips' ) }</a>
								</li>
								<li>
									<a href="https://wordpress.com/business-name-generator/">
										{ translate( 'Business Name Generator' ) }
									</a>
								</li>
								<li>
									<a href="https://wordpress.com/logo-maker/">{ translate( 'Logo Maker' ) }</a>
								</li>
								<li>
									<a href="https://wordpress.com/webinars/">{ translate( 'Daily Webinars' ) }</a>
								</li>
								<li>
									<a href="https://wordpress.com/courses/">{ translate( 'WordPress Courses' ) }</a>
								</li>
								<li>
									<a href="https://developer.wordpress.com/" data-is_external="1">
										{ translate( 'Developer' ) }{ ' ' }
										<span className="lp-link-chevron-external">{ translate( 'Resources' ) }</span>
									</a>
								</li>
							</ul>
						</div>
						<div>
							<h3>{ translate( 'Company' ) }</h3>
							<ul>
								<li>
									<a href="https://wordpress.com/about/">{ translate( 'About' ) }</a>
								</li>
								<li>
									<a href="https://wordpress.com/partners/">{ translate( 'Partners' ) }</a>
								</li>
								<li>
									<a href="https://automattic.com/press/" data-is_external="1">
										<span className="lp-link-chevron-external">{ translate( 'Press' ) }</span>
									</a>
								</li>
								<li>
									<a href="https://wordpress.com/tos/">{ translate( 'Terms of Service' ) }</a>
								</li>
								<li>
									<a href="https://automattic.com/privacy/" data-is_external="1">
										{ translate( 'Privacy' ) }{ ' ' }
										<span className="lp-link-chevron-external">{ translate( 'Policy' ) }</span>
									</a>
								</li>
							</ul>
						</div>
					</div>
					<div className="lpc-footer-subnav-container">
						<div className="lp-footer-language">
							<h2 className="lp-hidden">{ translate( 'Language' ) }</h2>
							<div className="lp-language-picker">
								<div className="lp-language-picker__icon"></div>
								<div className="lp-language-picker__chevron"></div>
								<select
									className="lp-language-picker__content"
									title={ translate( 'Change Language' ) }
									onChange={ ( e ) => navigate( e.target.value ) }
									defaultValue={ `${ window.location.pathname }` }
								>
									<option>{ translate( 'Change Language' ) }</option>
									<option lang="es" value={ `/es/${ realPathName }` }>
										Español
									</option>
									<option lang="pt-br" value={ `/pt-br/${ realPathName }` }>
										Português do Brasil
									</option>
									<option lang="de" value={ `/de/${ realPathName }` }>
										Deutsch
									</option>
									<option lang="fr" value={ `/fr/${ realPathName }` }>
										Français
									</option>
									<option lang="he" value={ `/he/${ realPathName }` }>
										עִבְרִית
									</option>
									<option lang="ja" value={ `/ja/${ realPathName }` }>
										日本語
									</option>
									<option lang="it" value={ `/it/${ realPathName }` }>
										Italiano
									</option>
									<option lang="nl" value={ `/nl/${ realPathName }` }>
										Nederlands
									</option>
									<option lang="ru" value={ `/ru/${ realPathName }` }>
										Русский
									</option>
									<option lang="tr" value={ `/tr/${ realPathName }` }>
										Türkçe
									</option>
									<option lang="id" value={ `/id/${ realPathName }` }>
										Bahasa Indonesia
									</option>
									<option lang="zh-cn" value={ `/zh-cn/${ realPathName }` }>
										简体中文
									</option>
									<option lang="zh-tw" value={ `/zh-tw/${ realPathName }` }>
										繁體中文
									</option>
									<option lang="ko" value={ `/ko/${ realPathName }` }>
										한국어
									</option>
									<option lang="ar" value={ `/ar/${ realPathName }` }>
										العربية
									</option>
									<option lang="sv" value={ `/sv/${ realPathName }` }>
										Svenska
									</option>
									<option lang="el" value={ `/el/${ realPathName }` }>
										Ελληνικά
									</option>
									<option lang="en" value={ `/${ realPathName }` }>
										English
									</option>
									<option lang="ro" value={ `/ro/${ realPathName }` }>
										Română
									</option>
								</select>
							</div>
						</div>
						<div className="lpc-footer-mobile-apps">
							<h2 className="lp-hidden">{ translate( 'Mobile Apps' ) }</h2>
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
													{ translate( 'Get it on' ) }
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
													{ translate( 'Download on the' ) }
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
							<h2 className="lp-hidden">{ translate( 'Social Media' ) }</h2>
							<ul className="lp-footer-social-icons">
								<li>
									<a href="https://twitter.com/wordpressdotcom" title="WordPress.com on Twitter">
										<span className="lp-hidden">{ translate( 'WordPress.com on Twitter' ) }</span>
										<SocialLogo size={ 24 } icon="twitter-alt" className="lp-icon" />
									</a>
								</li>
								<li>
									<a
										href="https://www.facebook.com/WordPresscom/"
										title="WordPress.com on Facebook"
									>
										<span className="lp-hidden">{ translate( 'WordPress.com on Facebook' ) }</span>
										<SocialLogo size={ 24 } icon="facebook" className="lp-icon" />
									</a>
								</li>
								<li>
									<a
										href="https://www.instagram.com/wordpressdotcom/"
										title="WordPress.com on Instagram"
									>
										<span className="lp-hidden">{ translate( 'WordPress.com on Instagram' ) }</span>
										<SocialLogo size={ 24 } icon="instagram" className="lp-icon" />
									</a>
								</li>
								<li>
									<a
										href="https://www.youtube.com/WordPressdotcom"
										title="WordPress.com on YouTube"
									>
										<span className="lp-hidden">{ translate( 'WordPress.com on YouTube' ) }</span>
										<SocialLogo size={ 24 } icon="youtube" className="lp-icon" />
									</a>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</section>
		</>
	);
};

export default UniversalNavbarFooter;
