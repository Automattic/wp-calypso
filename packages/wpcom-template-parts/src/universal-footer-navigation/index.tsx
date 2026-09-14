/* eslint-disable no-restricted-imports */
/* eslint-disable wpcalypso/jsx-classname-namespace -- markup mirrors the WPCOM twin's Landpack class names verbatim */
import {
	localizeUrl as pureLocalizeUrl,
	removeLocaleFromPathLocaleInFront,
	useLocale,
	useLocalizeUrl,
} from '@automattic/i18n-utils';
import { __ } from '@wordpress/i18n';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useLayoutEffect, useState } from 'react';
import { AutomatticBrand, getAutomatticBrandingNoun } from '../utils';
import {
	AppStoreIconSvg,
	ChevronSvg,
	FacebookIconSvg,
	FooterLogoSvg,
	GooglePlayIconSvg,
	InstagramIconSvg,
	LanguageGlobeSvg,
	XIconSvg,
	YoutubeIconSvg,
} from './svgs';
import { getFooterColumns } from './taxonomy';
import type { FooterProps, PureFooterProps } from '../types';
import type { FooterColumn } from './taxonomy';

import './style.scss';

const useIsomorphicEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const defaultOnLanguageChange: React.ChangeEventHandler< HTMLSelectElement > = ( event ) => {
	const pathWithoutLocale = removeLocaleFromPathLocaleInFront( window.location.pathname );

	window.location.href = `/${ event.target.value }${ pathWithoutLocale }`;
};

// Locale list and order per the WPCOM twin's language picker; English last.
// Exported for the drift test against @automattic/languages.
export const languageEntries: [ string, string ][] = [
	[ 'de', 'Deutsch' ],
	[ 'es', 'Español' ],
	[ 'fr', 'Français' ],
	[ 'id', 'Bahasa Indonesia' ],
	[ 'it', 'Italiano' ],
	[ 'nl', 'Nederlands' ],
	[ 'nb', 'Norsk bokmål' ],
	[ 'pl', 'Polski' ],
	[ 'pt-br', 'Português do Brasil' ],
	[ 'ro', 'Română' ],
	[ 'sv', 'Svenska' ],
	[ 'tr', 'Türkçe' ],
	[ 'vi', 'Tiếng Việt' ],
	[ 'el', 'Ελληνικά' ],
	[ 'ru', 'Русский' ],
	[ 'ar', 'العربية' ],
	[ 'he', 'עִבְרִית' ],
	[ 'ja', '日本語' ],
	[ 'ko', '한국어' ],
	[ 'th', 'ไทย' ],
	[ 'zh-cn', '简体中文' ],
	[ 'zh-tw', '繁體中文' ],
	[ 'en', 'English' ],
];

const APP_STORE_URL =
	'https://apps.apple.com/app/apple-store/id1565481562?ct=wp.com--footer&mt=8&pt=299112';
const GOOGLE_PLAY_URL =
	'https://play.google.com/store/apps/details?id=com.jetpack.android&referrer=utm_source%3Dwordpress.com%26utm_campaign%3Dfooter%26utm_medium%3Dwebsite';

const FooterStack = ( {
	column,
	open,
	additionalCompanyLinks,
}: {
	column: FooterColumn;
	open: boolean;
	additionalCompanyLinks?: React.ReactNode;
} ) => (
	<div className="lp-grid__column-span-4 lp-grid__column-span-1@L">
		<details className="lp-footer-stack" open={ open }>
			<summary>
				<div className="lp-footer-stack__summary lp-color-primary">
					<div className="lp-footer-stack__summary__content lp-bold">{ column.title }</div>
					<ChevronSvg className="lp-footer-stack__summary__marker lp-display-none@L" />
				</div>
			</summary>
			<ul className="lp-footer-stack__content">
				{ column.links.map( ( link ) => (
					<li key={ link.slug } className={ `lp-block x-nav-footer--${ link.slug }` }>
						<a
							className="lp-footer-stack__content__item lp-link-invisible"
							href={ link.url }
							{ ...( link.isCcpaNotice && { 'data-is-ccpa-dnsd': '1' } ) }
						>
							{ link.chevron ? (
								<span className="lp-link-chevron-external">{ link.label }</span>
							) : (
								link.label
							) }
						</a>
					</li>
				) ) }
				{ /* The twin's do-not-sell script targets this exact class; the empty
				     li must render even when the slot is unfilled so the anchor point
				     exists. Fill it via the additionalCompanyLinks prop. */ }
				{ column.id === 'company' && (
					<li className="lp-block x-nav-footer--ccpa-dnsd">{ additionalCompanyLinks }</li>
				) }
			</ul>
		</details>
	</div>
);

/**
 * This component doesn't depend on any hooks or state. This makes it Gutenberg save.js friendly.
 */
export const PureUniversalNavbarFooter = ( {
	isLoggedIn = typeof window !== 'undefined'
		? document.body.classList.contains( 'logged-in' )
		: false,
	additionalCompanyLinks = null,
	localizeUrl = pureLocalizeUrl,
	automatticBranding = <AutomatticBrand />,
	locale,
	currentRoute,
	collapseStacks = false,
}: PureFooterProps ) => {
	const columns = getFooterColumns( { localizeUrl, locale, isLoggedIn } );

	return (
		<div className="wpcom-global-nav-footer">
			<section
				className="lp-block lp-footer-section lp-section is-style-text-white-background-gray-100 lp-padding-top-7 lp-padding-bottom-0"
				data-section-name="footer"
			>
				<div className="lp-section__content has-small-font-size has-text-align-left">
					<div className="lp-wrapper lp-wrapper--layout-center-minus lp-wrapper--layout-wide@L">
						<div className="lp-padding-bottom-5 lp-padding-bottom-6@L">
							<h2 className="lp-hidden">WordPress.com</h2>
							<FooterLogoSvg />
						</div>
						<div className="lp-grid lp-grid--type-footer lp-grid--gutter-y-4">
							{ columns.map( ( column ) => (
								<FooterStack
									key={ column.id }
									column={ column }
									open={ ! collapseStacks }
									additionalCompanyLinks={ additionalCompanyLinks }
								/>
							) ) }
						</div>
						<div className="lp-grid lp-grid--type-footer lp-padding-top-7">
							<div className="lp-grid__column-span-4 lp-grid__column-span-1@L lp-grid__order-1@L lp-pb-36 lp-pb-0@L">
								{ ! isLoggedIn && (
									<div
										className="lp-language-picker"
										role="combobox"
										aria-expanded="false"
										aria-controls="language-picker-select"
										aria-label={ __( 'Change language', __i18n_text_domain__ ) }
									>
										<select
											id="language-picker-select"
											className="lp-language-picker__content"
											title={ __( 'Change Language', __i18n_text_domain__ ) }
											onChange={ defaultOnLanguageChange }
											defaultValue={ locale }
										>
											{ languageEntries.map( ( [ code, label ] ) => (
												<option key={ code } lang={ code } value={ code }>
													{ label }
												</option>
											) ) }
										</select>
										<LanguageGlobeSvg />
										<ChevronSvg className="lp-language-picker__chevron" />
										{ languageEntries.map( ( [ code, label ] ) => {
											const href =
												code === 'en'
													? `https://wordpress.com/${ currentRoute ?? '' }`
													: `https://wordpress.com/${ code }/${ currentRoute ?? '' }`;
											return (
												<a
													key={ code }
													className="lp-language-picker__link lp-hidden"
													lang={ code }
													href={ href }
													data-href={ href }
													tabIndex={ -1 }
												>
													{ label }
												</a>
											);
										} ) }
									</div>
								) }
							</div>
							<div className="lp-grid__column-span-4 lp-grid__column-span-4@L">
								<div className="lp-flex@L lp-flex--align-center@L has-text-align-center">
									<h3 className="lp-hidden">{ __( 'Mobile Apps', __i18n_text_domain__ ) }</h3>
									<ul className="lp-flex lp-flex--justify-center lp-flex--wrap lp-flex--gap-1 has-normal-font-size">
										<li>
											<div className="lp-block lp-mobile-badge lp-mobile-badge--type-apple-app-store">
												<a className="lp-mobile-badge__link" href={ APP_STORE_URL }>
													<span className="lp-mobile-badge__content">
														<AppStoreIconSvg />
														<span className="lp-mobile-badge__content__label">
															<span className="lp-mobile-badge__line lp-mobile-badge__line--is-top">
																{ __( 'Download on the', __i18n_text_domain__ ) }
															</span>{ ' ' }
															<span className="lp-mobile-badge__line lp-mobile-badge__line--is-bottom">
																App Store
															</span>
														</span>
													</span>
												</a>
											</div>
										</li>
										<li>
											<div className="lp-block lp-mobile-badge lp-mobile-badge--type-google-play">
												<a className="lp-mobile-badge__link" href={ GOOGLE_PLAY_URL }>
													<span className="lp-mobile-badge__content">
														<GooglePlayIconSvg />
														<span className="lp-mobile-badge__content__label">
															<span className="lp-mobile-badge__line lp-mobile-badge__line--is-top">
																{ __( 'Get it on', __i18n_text_domain__ ) }
															</span>{ ' ' }
															<span className="lp-mobile-badge__line lp-mobile-badge__line--is-bottom">
																Google Play
															</span>
														</span>
													</span>
												</a>
											</div>
										</li>
									</ul>
									<h3 className="lp-hidden">{ __( 'Social Media', __i18n_text_domain__ ) }</h3>
									<ul className="lp-footer-social-media lp-flex lp-flex--justify-center lp-pt-18 lp-pt-0@L lp-pl-24@L">
										<li className="lp-block x-nav-footer--facebook lp-pl-8@L">
											<a
												className="lp-display-block lp-pt-12 lp-pr-8 lp-pb-12 lp-pl-8 lp-color"
												href="https://www.facebook.com/WordPresscom/"
												title="WordPress.com on Facebook"
											>
												<span className="lp-hidden">
													{ __( 'WordPress.com on Facebook', __i18n_text_domain__ ) }
												</span>
												<FacebookIconSvg />
											</a>
										</li>
										<li className="lp-block x-nav-footer--twitter">
											<a
												className="lp-display-block lp-pt-12 lp-pr-8 lp-pb-12 lp-pl-8 lp-color"
												href="https://x.com/wordpressdotcom"
												title="WordPress.com on X (Twitter)"
											>
												<span className="lp-hidden">
													{ __( 'WordPress.com on X (Twitter)', __i18n_text_domain__ ) }
												</span>
												<XIconSvg />
											</a>
										</li>
										<li className="lp-block x-nav-footer--instagram">
											<a
												className="lp-display-block lp-pt-12 lp-pr-8 lp-pb-12 lp-pl-8 lp-color"
												href="https://www.instagram.com/wordpressdotcom/"
												title="WordPress.com on Instagram"
											>
												<span className="lp-hidden">
													{ __( 'WordPress.com on Instagram', __i18n_text_domain__ ) }
												</span>
												<InstagramIconSvg />
											</a>
										</li>
										<li className="lp-block x-nav-footer--youtube">
											<a
												className="lp-display-block lp-pt-12 lp-pr-8 lp-pb-12 lp-pl-8 lp-color"
												href="https://www.youtube.com/WordPressdotcom"
												title="WordPress.com on YouTube"
											>
												<span className="lp-hidden">
													{ __( 'WordPress.com on YouTube', __i18n_text_domain__ ) }
												</span>
												<YoutubeIconSvg />
											</a>
										</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
					<div className="lp-wrapper lp-wrapper--layout-full lp-padding-top-5">
						<footer className="lp-section is-style-white-gray-mono lp-padding-top-4 lp-padding-bottom-4">
							<div className="lp-section__content has-tiny-font-size has-text-align-center">
								<h2 className="lp-hidden">Automattic</h2>
								<div className="lp-wrapper lp-wrapper--layout-wide">
									<div className="lp-grid lp-grid--type-footer lp-grid--align-baseline lp-grid--gutter-y-3">
										<div className="lp-grid__column-span-4 lp-grid__column-span-2@M lp-text-left@M color-blue-50">
											<a
												className="lp-flex lp-flex--inline lp-link-invisible lp-no-wrap"
												href="https://automattic.com"
											>
												{ automatticBranding }
											</a>
										</div>
										<div className="lp-grid__column-span-4 lp-grid__column-span-2@M lp-text-right@M lp-color-primary">
											<a
												className="lp-link-invisible lp-link-chevron-external"
												href="https://automattic.com/work-with-us/"
												title={ __( 'Remote Jobs', __i18n_text_domain__ ) }
											>
												{ __( 'Work With Us', __i18n_text_domain__ ) }
											</a>
										</div>
									</div>
								</div>
							</div>
						</footer>
					</div>
				</div>
			</section>
		</div>
	);
};

const UniversalNavbarFooter = ( {
	isLoggedIn = false,
	currentRoute,
	additionalCompanyLinks,
}: FooterProps ) => {
	const localizeUrl = useLocalizeUrl();
	const locale = useLocale();
	const translate = useTranslate();
	const pathNameWithoutLocale =
		currentRoute && removeLocaleFromPathLocaleInFront( currentRoute ).slice( 1 );
	const [ collapseStacks, setCollapseStacks ] = useState( false );
	const [ automatticBranding, setAutomatticBranding ] = useState<
		React.ReactElement | string | number | undefined
	>( undefined );

	// Effects don't run in SSR, so the server-rendered markup must already look
	// right: stacks render expanded and the branding shows the plain Automattic
	// logo. On the client, small screens collapse the stacks into tap-to-expand
	// accordions — tracking viewport changes so a resized window follows the
	// breakpoint like the twin does — and the branding picks a random
	// "An Automattic …" noun.
	useIsomorphicEffect( () => {
		const mediaQuery = window.matchMedia( '(max-width: 1151px)' );
		setCollapseStacks( mediaQuery.matches );

		const onChange = ( event: MediaQueryListEvent ) => setCollapseStacks( event.matches );
		mediaQuery.addEventListener( 'change', onChange );
		return () => mediaQuery.removeEventListener( 'change', onChange );
	}, [] );

	useIsomorphicEffect( () => {
		setAutomatticBranding( getAutomatticBrandingNoun( translate ) );
	}, [ translate ] );

	return (
		<PureUniversalNavbarFooter
			locale={ locale }
			isLoggedIn={ isLoggedIn }
			currentRoute={ pathNameWithoutLocale }
			additionalCompanyLinks={ additionalCompanyLinks }
			localizeUrl={ localizeUrl }
			automatticBranding={ automatticBranding }
			collapseStacks={ collapseStacks }
		/>
	);
};

export default UniversalNavbarFooter;
