import './style.scss';
import { useTranslate } from 'i18n-calypso';

const PluginNavbarFooter = () => {
	const translate = useTranslate();
	const automatticRoger = translate(
		'brainchild contraption creation experiment invention joint medley opus production ruckus thingamajig'
	);

	return (
		<>
			<section
				id="lpc-footer-nav"
				data-vars-ev-id="lpc-footer-nav"
				class="lpc lpc-footer-nav"
				data-vars-ev-class="lpc lpc-footer-nav"
			>
				<h2 class="lp-hidden">WordPress.com</h2>
				<div class="lpc-footer-nav-wrapper">
					<div class="lpc-footer-nav-container">
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
										<span class="lp-link-chevron-external">{ translate( 'Solutions' ) }</span>
									</a>
								</li>
								<li>
									<a
										href="https://wordpress.com/do-it-for-me/?ref=footer_pricing"
										title="WordPress Website Building Service"
									>
										{ translate( 'Built by&nbsp;WordPress.com' ) }
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
									<a href="https://wordpress.com/go/">
										{ translate( 'Website Building&nbsp;Tips' ) }
									</a>
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
										<span class="lp-link-chevron-external">{ translate( 'Resources' ) }</span>
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
										<span class="lp-link-chevron-external">{ translate( 'Press' ) }</span>
									</a>
								</li>
								<li>
									<a href="https://wordpress.com/tos/">{ translate( 'Terms of Service' ) }</a>
								</li>
								<li>
									<a href="https://automattic.com/privacy/" data-is_external="1">
										{ translate( 'Privacy' ) }{ ' ' }
										<span class="lp-link-chevron-external">{ translate( 'Policy' ) }</span>
									</a>
								</li>
							</ul>
						</div>
					</div>
					<div class="lpc-footer-subnav-container">
						<div class="lp-footer-language">
							<h2 class="lp-hidden">{ translate( 'Language' ) }</h2>
							<div class="lp-language-picker">
								<div class="lp-language-picker__icon"></div>
								<div class="lp-language-picker__chevron"></div>
								<select
									class="lp-language-picker__content"
									title={ translate( 'Change Language' ) }
									on=""
									field_signature="4203909268"
									form_signature="8397282043604359108"
									visibility_annotation="true"
								>
									<option disabled="">{ translate( 'Change Language' ) }</option>
									<option lang="es" value="https://wordpress.com/es/plugins">
										Español
									</option>
									<option lang="pt-br" value="https://wordpress.com/pt-br/plugins">
										Português do Brasil
									</option>
									<option lang="de" value="https://wordpress.com/de/plugins">
										Deutsch
									</option>
									<option lang="fr" value="https://wordpress.com/fr/plugins">
										Français
									</option>
									<option lang="he" value="https://wordpress.com/he/plugins">
										עִבְרִית
									</option>
									<option lang="ja" value="https://wordpress.com/ja/plugins">
										日本語
									</option>
									<option lang="it" value="https://wordpress.com/it/plugins">
										Italiano
									</option>
									<option lang="nl" value="https://wordpress.com/nl/plugins">
										Nederlands
									</option>
									<option lang="ru" value="https://wordpress.com/ru/plugins">
										Русский
									</option>
									<option lang="tr" value="https://wordpress.com/tr/plugins">
										Türkçe
									</option>
									<option lang="id" value="https://wordpress.com/id/plugins">
										Bahasa Indonesia
									</option>
									<option lang="zh-cn" value="https://wordpress.com/zh-cn/plugins">
										简体中文
									</option>
									<option lang="zh-tw" value="https://wordpress.com/zh-tw/plugins">
										繁體中文
									</option>
									<option lang="ko" value="https://wordpress.com/ko/plugins">
										한국어
									</option>
									<option lang="ar" value="https://wordpress.com/ar/plugins">
										العربية
									</option>
									<option lang="sv" value="https://wordpress.com/sv/plugins">
										Svenska
									</option>
									<option lang="el" value="https://wordpress.com/el/plugins">
										Ελληνικά
									</option>
									<option lang="en" value="https://wordpress.com/plugins" selected="">
										English
									</option>
									<option lang="ro" value="https://wordpress.com/ro/plugins">
										Română
									</option>
								</select>
							</div>
						</div>
						<div class="lpc-footer-mobile-apps">
							<h2 class="lp-hidden">{ translate( 'Mobile Apps' ) }</h2>
							<ul class="lp-footer-mobile-icons">
								<li>
									<a
										class="lp-app-button lp-app-button--type-google-play"
										href="https://play.google.com/store/apps/details?id=org.wordpress.android"
									>
										<span class="lp-app-button__content">
											<svg
												class="lp-app-button__content__icon"
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 23 25"
												aria-hidden="true"
											>
												<defs>
													<linearGradient id="lp-gp-a" x1="50%" x2="40%" y1="25%" y2="50%">
														<stop offset="0%" stop-color="#00c4ff"></stop>
														<stop offset="100%" stop-color="#00e3ff"></stop>
													</linearGradient>
													<linearGradient id="lp-gp-b" x1="0%" x2="100%" y1="50%" y2="50%">
														<stop offset="0%" stop-color="#fb0"></stop>
														<stop offset="100%" stop-color="#fd0"></stop>
													</linearGradient>
													<linearGradient id="lp-gp-c" x1="100%" x2="0%" y1="20%" y2="80%">
														<stop offset="0%" stop-color="#df2454"></stop>
														<stop offset="100%" stop-color="#ff3a44"></stop>
													</linearGradient>
													<linearGradient id="lp-gp-d" x1="0%" x2="100%" y1="20%" y2="80%">
														<stop offset="0%" stop-color="#13d375"></stop>
														<stop offset="100%" stop-color="#00f076"></stop>
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
											<span class="lp-app-button__content__label">
												<span class="lp-app-button__line lp-app-button__line--top">
													{ translate( 'Get it on' ) }
												</span>
												<span class="lp-app-button__line lp-app-button__line--bottom">
													{ translate( 'Google Play' ) }
												</span>
											</span>
										</span>
									</a>
								</li>
								<li>
									<a
										class="lp-app-button lp-app-button--type-app-store"
										href="https://apps.apple.com/us/app/wordpress/id335703880"
									>
										<span class="lp-app-button__content">
											<svg
												class="lp-app-button__content__icon"
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 18 23"
												aria-hidden="true"
											>
												<path
													fill="#fff"
													d="m12.88 5.97.28.02c1.6.05 3.08.85 4 2.16a4.95 4.95 0 0 0-2.36 4.15 4.78 4.78 0 0 0 2.92 4.4 10.96 10.96 0 0 1-1.52 3.1c-.9 1.33-1.83 2.64-3.32 2.66-1.45.04-1.94-.85-3.6-.85-1.67 0-2.19.83-3.57.89-1.42.05-2.5-1.43-3.43-2.76-1.85-2.7-3.3-7.63-1.36-10.97a5.32 5.32 0 0 1 4.47-2.73C6.81 6 8.13 7 9 7c.86 0 2.48-1.18 4.16-1zm.3-5.25a4.87 4.87 0 0 1-1.11 3.49 4.1 4.1 0 0 1-3.24 1.53 4.64 4.64 0 0 1 1.14-3.36A4.96 4.96 0 0 1 13.18.72z"
												></path>
											</svg>
											<span class="lp-app-button__content__label">
												<span class="lp-app-button__line lp-app-button__line--top">
													{ translate( 'Download on the' ) }
												</span>
												<span class="lp-app-button__line lp-app-button__line--bottom">
													{ translate( 'App Store' ) }
												</span>
											</span>
										</span>
									</a>
								</li>
							</ul>
						</div>

						<div class="lp-footer-social-media">
							<h2 class="lp-hidden">{ translate( 'Social Media' ) }</h2>
							<ul class="lp-footer-social-icons">
								<li>
									<a href="https://twitter.com/wordpressdotcom" title="WordPress.com on Twitter">
										<span class="lp-hidden">{ translate( 'WordPress.com on Twitter' ) }</span>
										<svg
											class="lp-icon"
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											aria-hidden="true"
										>
											<path d="M22.23 5.92a8.21 8.21 0 0 1-2.36.65 4.12 4.12 0 0 0 1.8-2.27 8.22 8.22 0 0 1-2.6 1 4.1 4.1 0 0 0-6.99 3.74 11.65 11.65 0 0 1-8.46-4.29 4.09 4.09 0 0 0-.55 2.06 4.1 4.1 0 0 0 1.82 3.42 4.09 4.09 0 0 1-1.86-.51v.05a4.1 4.1 0 0 0 3.3 4.02 4.1 4.1 0 0 1-1.86.07 4.11 4.11 0 0 0 3.83 2.85 8.24 8.24 0 0 1-5.1 1.76 8.33 8.33 0 0 1-.97-.06 11.62 11.62 0 0 0 6.29 1.84c7.55 0 11.67-6.25 11.67-11.67v-.53a8.3 8.3 0 0 0 2.04-2.13z"></path>
										</svg>
									</a>
								</li>
								<li>
									<a
										href="https://www.facebook.com/WordPresscom/"
										title="WordPress.com on Facebook"
									>
										<span class="lp-hidden">{ translate( 'WordPress.com on Facebook' ) }</span>
										<svg
											class="lp-icon"
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											aria-hidden="true"
										>
											<path d="M12 2C6.5 2 2 6.5 2 12c0 5 3.7 9.1 8.4 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7C18.3 21.1 22 17 22 12c0-5.5-4.5-10-10-10z"></path>
										</svg>
									</a>
								</li>
								<li>
									<a
										href="https://www.instagram.com/wordpressdotcom/"
										title="WordPress.com on Instagram"
									>
										<span class="lp-hidden">{ translate( 'WordPress.com on Instagram' ) }</span>
										<svg
											class="lp-icon"
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											aria-hidden="true"
										>
											<path d="M12 4.62c2.4 0 2.69.01 3.64.05.87.04 1.35.2 1.67.31.42.17.72.36 1.03.68.32.31.51.61.68 1.03.12.32.27.8.3 1.67.05.95.06 1.24.06 3.64s-.01 2.69-.05 3.64a4.99 4.99 0 0 1-.31 1.67c-.17.42-.36.72-.68 1.03-.31.32-.61.51-1.03.68-.32.12-.8.27-1.67.3-.95.05-1.24.06-3.64.06s-2.69-.01-3.64-.05a4.99 4.99 0 0 1-1.67-.31 2.79 2.79 0 0 1-1.03-.68 2.79 2.79 0 0 1-.68-1.03c-.12-.32-.27-.8-.3-1.67-.05-.95-.06-1.24-.06-3.64s.01-2.69.05-3.64c.04-.87.2-1.35.31-1.67.17-.42.36-.72.68-1.03.31-.32.61-.51 1.03-.68.32-.12.8-.27 1.67-.3.95-.05 1.24-.06 3.64-.06M12 3c-2.44 0-2.75.01-3.71.05-.96.05-1.61.2-2.18.42a4.4 4.4 0 0 0-1.6 1.04c-.5.5-.8 1-1.04 1.6a6.6 6.6 0 0 0-.42 2.18C3.01 9.25 3 9.56 3 12s.01 2.75.05 3.71c.05.96.2 1.61.42 2.19a4.5 4.5 0 0 0 2.64 2.63 6.6 6.6 0 0 0 2.18.42c.96.04 1.27.05 3.71.05s2.75-.01 3.71-.05a6.9 6.9 0 0 0 2.19-.42 4.41 4.41 0 0 0 1.59-1.04c.5-.5.8-1 1.04-1.6a6.6 6.6 0 0 0 .42-2.18c.04-.96.05-1.27.05-3.71s-.01-2.75-.05-3.71a6.63 6.63 0 0 0-.42-2.19 4.41 4.41 0 0 0-1.04-1.59c-.5-.5-1-.8-1.6-1.04a6.6 6.6 0 0 0-2.18-.42C14.75 3.01 14.44 3 12 3zm0 4.38a4.62 4.62 0 1 0 0 9.24 4.62 4.62 0 0 0 0-9.24zM12 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm4.8-8.88a1.08 1.08 0 1 0 0 2.16 1.08 1.08 0 0 0 0-2.16z"></path>
										</svg>
									</a>
								</li>
								<li>
									<a
										href="https://www.youtube.com/WordPressdotcom"
										title="WordPress.com on YouTube"
									>
										<span class="lp-hidden">{ translate( 'WordPress.com on YouTube' ) }</span>
										<svg
											class="lp-icon"
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											aria-hidden="true"
										>
											<path d="M21.8 8s-.2-1.38-.8-1.98c-.76-.8-1.6-.8-2-.85-2.8-.2-7-.2-7-.2s-4.2 0-7 .2c-.4.05-1.24.05-2 .85-.6.6-.8 1.98-.8 1.98S2 9.62 2 11.24v1.51c0 1.62.2 3.24.2 3.24s.2 1.38.8 1.99c.76.8 1.76.77 2.2.85 1.6.16 6.8.2 6.8.2s4.2 0 7-.2c.4-.05 1.24-.06 2-.85.6-.61.8-1.99.8-1.99s.2-1.62.2-3.23v-1.52C22 9.62 21.8 8 21.8 8zM9.93 14.6V8.96l5.4 2.82-5.4 2.8z"></path>
										</svg>
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

export default PluginNavbarFooter;
