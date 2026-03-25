/* eslint-disable no-restricted-imports */
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

const ChevronDown = () => (
	<svg
		className="lpc-footer-nav-chevron"
		xmlns="http://www.w3.org/2000/svg"
		width="20"
		height="20"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
	>
		<polyline points="6 9 12 15 18 9" />
	</svg>
);

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
	const languageEntries = Object.entries( languageOptions );
	const currentLocaleKey: string =
		( locale && ( allLanguageOptions[ locale ] ? locale : normalizedLocales[ locale ] ) ) || 'en';
	const currentLanguageName = allLanguageOptions[ currentLocaleKey ] || allLanguageOptions.en;

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
					<div className="lpc-footer-logo">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width={ 200 }
							height={ 27 }
							viewBox="0 0 134 18"
							className="wpcom-wordmark"
							aria-label="WordPress.com"
						>
							<path
								fillRule="evenodd"
								clipRule="evenodd"
								d="M0 9C0 4.0379 4.03719 0 9 0C13.9628 0 18 4.0379 18 9C18 13.9621 13.9628 18 9 18C4.03719 18 0 13.9621 0 9ZM15.5396 8.84597L13.0683 15.9921C15.4738 14.5892 17.0909 11.9835 17.0909 8.99817C17.0909 7.59169 16.7305 6.26773 16.0994 5.11614C16.1341 5.37469 16.1543 5.65159 16.1543 5.94866C16.1543 6.76834 16.0006 7.69071 15.5396 8.84597ZM11.0396 5.12714C11.0396 5.12714 10.6006 5.17848 10.114 5.20416L10.1159 5.20782L13.0409 13.9053L13.8476 11.2078C14.2591 10.1553 14.464 9.28423 14.464 8.59108C14.464 7.58985 14.1037 6.89853 13.7963 6.35941C13.7646 6.30801 13.7331 6.25724 13.7019 6.20698C13.3279 5.60461 13.0006 5.07757 13.0006 4.46149C13.0006 3.71883 13.564 3.02567 14.3598 3.02567C14.3806 3.02567 14.4015 3.02765 14.4223 3.02963C14.4362 3.03095 14.4501 3.03227 14.464 3.03301C13.0244 1.71271 11.1073 0.907702 9 0.907702C6.17195 0.907702 3.68598 2.35819 2.23719 4.55318C2.42744 4.55868 2.60671 4.56235 2.75854 4.56235C3.60549 4.56235 4.91524 4.45966 4.91524 4.45966C5.35061 4.43399 5.40183 5.07579 4.96646 5.12714C4.96646 5.12714 4.52927 5.17848 4.04085 5.20416L6.9878 13.9694L8.75854 8.65892L7.49817 5.20416C7.0628 5.17848 6.64939 5.12714 6.64939 5.12714C6.21402 5.10147 6.26341 4.43399 6.70061 4.45966C6.70061 4.45966 8.03597 4.56235 8.83171 4.56235C9.67866 4.56235 10.9884 4.45966 10.9884 4.45966C11.4238 4.43399 11.475 5.07579 11.0396 5.12714ZM6.71341 16.7604C7.43963 16.9731 8.2061 17.0905 9 17.0905C9.94207 17.0905 10.8457 16.9273 11.6872 16.632C11.6652 16.5972 11.6451 16.5605 11.6287 16.5202L9.14085 9.70599L6.71341 16.7604ZM1.60793 5.70477C1.15976 6.71149 0.907317 7.82457 0.907317 8.99817C0.907317 12.2017 2.76768 14.9688 5.46768 16.2799L1.60793 5.70477Z"
								fill="#fff"
							/>
							<path
								d="M33.3781 11.6607L35.4518 3.19849H37.6929L34.4474 14.7053H32.3904L30.0865 6.63024H29.9965L27.6885 14.7053H25.6315L22.3839 3.19849H24.625L26.6987 11.6544H26.8054L29.0193 3.19849H31.0595L33.2776 11.6607H33.3781Z"
								fill="#fff"
							/>
							<path
								fillRule="evenodd"
								clipRule="evenodd"
								d="M43.6672 6.51999C43.0499 6.14961 42.3196 5.96338 41.4763 5.96338C40.633 5.96338 39.9027 6.14961 39.2854 6.51999C38.6681 6.89037 38.1889 7.41141 37.8499 8.08102C37.5109 8.75063 37.3414 9.53324 37.3414 10.4247C37.3414 11.3161 37.5109 12.0945 37.8499 12.762C38.1889 13.4295 38.6681 13.9485 39.2854 14.3189C39.9027 14.6892 40.633 14.8755 41.4763 14.8755C42.3196 14.8755 43.0499 14.6892 43.6672 14.3189C44.2845 13.9485 44.7636 13.4295 45.1026 12.762C45.4416 12.0945 45.6111 11.3161 45.6111 10.4247C45.6111 9.53324 45.4416 8.75273 45.1026 8.08102C44.7636 7.41141 44.2845 6.89037 43.6672 6.51999ZM43.3219 11.8455C43.1712 12.2724 42.941 12.6114 42.6334 12.8646C42.3258 13.1177 41.945 13.2433 41.4867 13.2433C41.0285 13.2433 40.6309 13.1177 40.3212 12.8646C40.0115 12.6114 39.7813 12.2724 39.6307 11.8455C39.4779 11.4186 39.4026 10.9436 39.4026 10.4184C39.4026 9.89316 39.4779 9.41187 39.6307 8.9829C39.7813 8.55393 40.0136 8.21285 40.3212 7.95756C40.6309 7.70227 41.018 7.57463 41.4867 7.57463C41.9555 7.57463 42.3258 7.70227 42.6334 7.95756C42.941 8.21285 43.1691 8.55393 43.3219 8.9829C43.4746 9.41187 43.55 9.89106 43.55 10.4184C43.55 10.9457 43.4746 11.4186 43.3219 11.8455Z"
								fill="#fff"
							/>
							<path
								d="M49.4742 6.36154C49.8592 6.08951 50.2987 5.95349 50.7925 5.95349L50.7946 5.95558C50.9055 5.95558 51.0331 5.96186 51.1733 5.97023C51.3135 5.9786 51.4307 5.99325 51.5249 6.01208V7.88281C51.437 7.85351 51.3031 7.82631 51.1168 7.8012C50.9327 7.77818 50.7527 7.76562 50.5812 7.76562C50.2087 7.76562 49.8781 7.84514 49.583 8.00417C49.288 8.16321 49.0578 8.38292 48.8883 8.66332C48.7188 8.94581 48.6351 9.27016 48.6351 9.63635V14.7086H46.6012V6.07904H48.5723V7.51661H48.6623C48.8192 7.01859 49.0913 6.63356 49.4742 6.36154Z"
								fill="#fff"
							/>
							<path
								fillRule="evenodd"
								clipRule="evenodd"
								d="M57.817 7.50319H57.7333C57.6286 7.29394 57.4801 7.07004 57.2896 6.83149C57.0992 6.59294 56.8398 6.38997 56.5133 6.21838C56.1869 6.04888 55.7726 5.96309 55.2662 5.96309C54.6028 5.96309 54.0023 6.13258 53.4624 6.47157C52.9225 6.81056 52.4957 7.31068 52.1797 7.97192C51.8637 8.63316 51.7047 9.44297 51.7047 10.4014C51.7047 11.3597 51.8595 12.1549 52.1713 12.8161C52.4831 13.4795 52.9058 13.9838 53.4415 14.3332C53.9772 14.6827 54.584 14.8564 55.262 14.8564C55.7558 14.8564 56.166 14.7747 56.4924 14.6094C56.8188 14.4441 57.0804 14.2453 57.2792 14.011C57.478 13.7766 57.6286 13.5548 57.7333 13.3455H57.8567V14.7057H59.8572V3.19885H57.817V7.50319ZM57.6203 11.8578C57.4633 12.2763 57.2331 12.6048 56.9297 12.8392C56.6263 13.0735 56.2601 13.1907 55.8291 13.1907C55.398 13.1907 55.0088 13.0693 54.7033 12.8287C54.3978 12.588 54.1676 12.2553 54.0127 11.8347C53.8579 11.4141 53.7805 10.9329 53.7805 10.393C53.7805 9.85311 53.8579 9.38229 54.0107 8.96587C54.1634 8.54946 54.3936 8.22512 54.697 7.98866C55.0004 7.7522 55.3792 7.63502 55.8312 7.63502C56.2831 7.63502 56.6389 7.75011 56.9402 7.9782C57.2415 8.20628 57.4696 8.52644 57.6265 8.93867C57.7814 9.3509 57.8588 9.83637 57.8588 10.393C57.8588 10.9496 57.7793 11.4392 57.6224 11.8598L57.6203 11.8578Z"
								fill="#fff"
							/>
							<path
								fillRule="evenodd"
								clipRule="evenodd"
								d="M65.781 3.19849C66.6662 3.19849 67.409 3.3638 68.0096 3.69232C68.6101 4.02085 69.0642 4.47284 69.3739 5.04829C69.6815 5.62373 69.8363 6.26823 69.8363 7.0069C69.8363 7.74556 69.6815 8.40052 69.3697 8.97388C69.0579 9.54723 68.5997 9.99713 67.9928 10.3257C67.386 10.6542 66.639 10.8174 65.7517 10.8174H63.5504V14.7053H61.4662V3.19849H65.781ZM66.7436 8.83158C67.0721 8.65372 67.3169 8.40471 67.476 8.09083L67.4781 8.09292C67.6371 7.77904 67.7166 7.41912 67.7166 7.00899C67.7166 6.59885 67.6371 6.24103 67.4781 5.92924C67.319 5.61745 67.0721 5.37472 66.7415 5.20104C66.4088 5.02736 65.984 4.93947 65.4629 4.93947H63.5525V9.10152H65.4734C65.9903 9.10152 66.413 9.01154 66.7436 8.83158Z"
								fill="#fff"
							/>
							<path
								d="M74.8436 5.95349C74.3498 5.95349 73.9103 6.08951 73.5253 6.36154C73.1424 6.63356 72.8703 7.01859 72.7134 7.51661H72.6234V6.07904H70.6522V14.7086H72.6862V9.63635C72.6862 9.27016 72.7699 8.94581 72.9394 8.66332C73.1089 8.38292 73.3391 8.16321 73.6341 8.00417C73.9292 7.84514 74.2598 7.76562 74.6322 7.76562C74.8038 7.76562 74.9838 7.77818 75.1679 7.8012C75.3542 7.82631 75.4881 7.85351 75.576 7.88281V6.01208C75.4818 5.99325 75.3646 5.9786 75.2244 5.97023C75.0842 5.96186 74.9566 5.95558 74.8457 5.95558L74.8436 5.95349Z"
								fill="#fff"
							/>
							<path
								fillRule="evenodd"
								clipRule="evenodd"
								d="M81.2888 6.21867C81.7617 6.38816 82.1802 6.65182 82.5464 7.00755L82.5485 7.01174C82.9126 7.36747 83.2013 7.81946 83.4106 8.3677C83.6199 8.91804 83.7245 9.56881 83.7245 10.3263V10.9499H77.7147C77.721 11.4291 77.8089 11.8434 77.9868 12.1887C78.1709 12.5465 78.4262 12.8206 78.7568 13.0089C79.0853 13.1994 79.4725 13.2935 79.914 13.2935C80.209 13.2935 80.4769 13.2538 80.7175 13.168C80.9581 13.0822 81.1653 12.9587 81.3411 12.7934C81.5169 12.6281 81.6508 12.423 81.7408 12.1803L83.6387 12.3937C83.5194 12.8959 83.2913 13.3333 82.9565 13.7058C82.6217 14.0782 82.1948 14.3649 81.6738 14.57C81.1527 14.7729 80.5564 14.8755 79.8868 14.8755C79.0205 14.8755 78.2755 14.6955 77.6478 14.3335C77.0221 13.9715 76.5387 13.4588 76.2018 12.7934C75.8649 12.128 75.6954 11.3286 75.6954 10.4414C75.6954 9.55417 75.8649 8.77365 76.2039 8.10195C76.5429 7.43024 77.0179 6.90502 77.6289 6.52836C78.2379 6.15171 78.9556 5.96338 79.7801 5.96338C80.3116 5.96338 80.8158 6.04917 81.2888 6.21867ZM77.9805 8.63345C77.8235 8.92222 77.7398 9.23819 77.721 9.57509L77.7231 9.573H81.7763C81.7721 9.18379 81.6884 8.83643 81.5231 8.53092C81.3578 8.22541 81.1297 7.98477 80.8347 7.80899C80.5396 7.63322 80.1986 7.54533 79.8093 7.54533C79.3929 7.54533 79.0267 7.64578 78.7129 7.84666C78.399 8.04754 78.1542 8.30911 77.9805 8.63345Z"
								fill="#fff"
							/>
							<path
								d="M89.2193 9.78434L87.7482 9.47046C87.3109 9.37002 86.997 9.24028 86.8066 9.08335C86.6183 8.9264 86.5241 8.72134 86.5283 8.47023C86.5241 8.17728 86.6664 7.94082 86.9531 7.75668C87.2398 7.57254 87.5934 7.48046 88.0182 7.48046C88.3321 7.48046 88.5978 7.53069 88.8154 7.63322C89.0331 7.73575 89.2067 7.86758 89.3344 8.03289C89.4641 8.1982 89.5541 8.37398 89.6064 8.56021L91.4604 8.35724C91.3223 7.62276 90.9603 7.04103 90.3786 6.60997C89.7968 6.17891 88.9996 5.96338 87.9889 5.96338C87.3004 5.96338 86.6915 6.0701 86.1663 6.28563C85.639 6.50116 85.2288 6.80458 84.9359 7.19588C84.6429 7.58718 84.4965 8.04963 84.5006 8.58114C84.4965 9.21099 84.6931 9.72994 85.0907 10.1401C85.4883 10.5502 86.0993 10.8411 86.928 11.0127L88.399 11.3224C88.7966 11.4081 89.0896 11.5316 89.2779 11.6927C89.4662 11.8539 89.5625 12.0589 89.5625 12.3058C89.5625 12.5988 89.416 12.8436 89.1209 13.0424C88.8259 13.2412 88.4388 13.3396 87.9554 13.3396C87.472 13.3396 87.1079 13.2412 86.815 13.0424C86.522 12.8436 86.3316 12.5507 86.2416 12.1594L84.2579 12.3498C84.3814 13.1429 84.7664 13.7622 85.4088 14.2059C86.0533 14.6495 86.9029 14.8713 87.9596 14.8713C88.6794 14.8713 89.3156 14.7541 89.8701 14.5218C90.4246 14.2896 90.8577 13.9673 91.1716 13.553C91.4834 13.1387 91.6424 12.6616 91.6466 12.1175C91.6424 11.5002 91.4416 11.0001 91.0419 10.6172C90.6422 10.2342 90.0354 9.95593 89.2193 9.78016V9.78434Z"
								fill="#fff"
							/>
							<path
								d="M95.6939 9.47046L97.165 9.78434V9.78016C97.9811 9.95593 98.5879 10.2342 98.9876 10.6172C99.3872 11.0001 99.5881 11.5002 99.5923 12.1175C99.5881 12.6616 99.4291 13.1387 99.1173 13.553C98.8034 13.9673 98.3703 14.2896 97.8157 14.5218C97.2612 14.7541 96.6251 14.8713 95.9053 14.8713C94.8485 14.8713 93.999 14.6495 93.3545 14.2059C92.7121 13.7622 92.327 13.1429 92.2036 12.3498L94.1873 12.1594C94.2773 12.5507 94.4677 12.8436 94.7607 13.0424C95.0536 13.2412 95.4177 13.3396 95.9011 13.3396C96.3845 13.3396 96.7716 13.2412 97.0666 13.0424C97.3617 12.8436 97.5081 12.5988 97.5081 12.3058C97.5081 12.0589 97.4119 11.8539 97.2236 11.6927C97.0352 11.5316 96.7423 11.4081 96.3447 11.3224L94.8736 11.0127C94.045 10.8411 93.434 10.5502 93.0364 10.1401C92.6388 9.72994 92.4421 9.21099 92.4463 8.58114C92.4421 8.04963 92.5886 7.58718 92.8816 7.19588C93.1745 6.80458 93.5846 6.50116 94.112 6.28563C94.6372 6.0701 95.2461 5.96338 95.9346 5.96338C96.9453 5.96338 97.7425 6.17891 98.3242 6.60997C98.906 7.04103 99.268 7.62276 99.4061 8.35724L97.5521 8.56021C97.4998 8.37398 97.4098 8.1982 97.2801 8.03289C97.1524 7.86758 96.9787 7.73575 96.7611 7.63322C96.5435 7.53069 96.2777 7.48046 95.9639 7.48046C95.5391 7.48046 95.1854 7.57254 94.8988 7.75668C94.6121 7.94082 94.4698 8.17728 94.474 8.47023C94.4698 8.72134 94.564 8.9264 94.7523 9.08335C94.9427 9.24028 95.2566 9.37002 95.6939 9.47046Z"
								fill="#fff"
							/>
							<path
								d="M101.758 12.3688C101.417 12.3688 101.124 12.488 100.881 12.7287C100.639 12.9693 100.517 13.256 100.521 13.5929C100.517 13.9382 100.636 14.229 100.881 14.4697C101.124 14.7103 101.417 14.8296 101.758 14.8296C101.98 14.8296 102.183 14.7752 102.367 14.6643C102.553 14.5534 102.702 14.4048 102.817 14.2186C102.932 14.0302 102.991 13.8231 102.995 13.595C102.991 13.2581 102.867 12.9693 102.62 12.7308C102.373 12.4922 102.087 12.3709 101.758 12.3709V12.3688Z"
								fill="#fff"
							/>
							<path
								d="M107.843 7.60392C107.427 7.60392 107.06 7.71692 106.747 7.93873C106.433 8.16263 106.188 8.4807 106.014 8.89711C105.84 9.31143 105.753 9.80318 105.753 10.3912C105.753 10.9792 105.836 11.4835 106.01 11.9062C106.184 12.3289 106.426 12.6532 106.738 12.8792C107.052 13.1052 107.42 13.2182 107.843 13.2182C108.142 13.2182 108.41 13.1617 108.649 13.0466C108.887 12.9315 109.086 12.7662 109.247 12.5486C109.408 12.331 109.517 12.0673 109.578 11.7555H111.522C111.471 12.3665 111.294 12.9064 110.982 13.3772C110.67 13.8459 110.247 14.2142 109.712 14.4779C109.176 14.7416 108.546 14.8734 107.824 14.8734C106.962 14.8734 106.223 14.6851 105.608 14.3063C104.993 13.9297 104.52 13.4065 104.187 12.7369C103.855 12.0673 103.689 11.3014 103.689 10.4247C103.689 9.54789 103.859 8.77365 104.196 8.10195C104.533 7.43024 105.01 6.90502 105.625 6.52836C106.242 6.15171 106.97 5.96338 107.814 5.96338C108.515 5.96338 109.134 6.09312 109.676 6.3484C110.218 6.60369 110.649 6.9657 110.971 7.43234C111.294 7.89897 111.478 8.44303 111.522 9.06451H109.578C109.5 8.6481 109.312 8.30074 109.019 8.02243C108.726 7.74412 108.333 7.60392 107.843 7.60392Z"
								fill="#fff"
							/>
							<path
								fillRule="evenodd"
								clipRule="evenodd"
								d="M118.362 6.51999C117.745 6.14961 117.014 5.96338 116.171 5.96338C115.328 5.96338 114.598 6.14961 113.98 6.51999C113.363 6.89037 112.884 7.41141 112.545 8.08102C112.206 8.75063 112.036 9.53324 112.036 10.4247C112.036 11.3161 112.206 12.0945 112.545 12.762C112.884 13.4295 113.363 13.9485 113.98 14.3189C114.598 14.6892 115.328 14.8755 116.171 14.8755C117.014 14.8755 117.745 14.6892 118.362 14.3189C118.979 13.9485 119.458 13.4295 119.797 12.762C120.136 12.0945 120.306 11.3161 120.306 10.4247C120.306 9.53324 120.136 8.75273 119.797 8.08102C119.458 7.41141 118.979 6.89037 118.362 6.51999ZM118.017 11.8455C117.866 12.2724 117.636 12.6114 117.328 12.8646C117.021 13.1177 116.64 13.2433 116.182 13.2433C115.723 13.2433 115.326 13.1177 115.016 12.8646C114.706 12.6114 114.476 12.2724 114.326 11.8455C114.173 11.4186 114.097 10.9436 114.097 10.4184C114.097 9.89316 114.173 9.41187 114.326 8.9829C114.476 8.55393 114.708 8.21285 115.016 7.95756C115.326 7.70227 115.713 7.57463 116.182 7.57463C116.65 7.57463 117.021 7.70227 117.328 7.95756C117.636 8.21285 117.864 8.55393 118.017 8.9829C118.169 9.41187 118.245 9.89106 118.245 10.4184C118.245 10.9457 118.169 11.4186 118.017 11.8455Z"
								fill="#fff"
							/>
							<path
								d="M130.735 5.96254C131.528 5.96254 132.177 6.21365 132.679 6.71585L132.677 6.71167C133.179 7.21388 133.431 7.94626 133.431 8.90883V14.701H131.39V9.22271C131.39 8.68911 131.248 8.29572 130.963 8.0467C130.679 7.79769 130.331 7.67214 129.919 7.67214C129.43 7.67214 129.047 7.8249 128.77 8.13041C128.496 8.43592 128.358 8.8314 128.358 9.31896V14.701H126.364V9.13901C126.364 8.6933 126.23 8.33757 125.962 8.07181C125.694 7.80606 125.345 7.67214 124.914 7.67214C124.623 7.67214 124.357 7.74538 124.117 7.89395C123.876 8.04252 123.686 8.24968 123.543 8.51752C123.401 8.78537 123.33 9.09716 123.33 9.45289V14.701H121.296V6.07135H123.24V7.53822H123.34C123.52 7.04438 123.817 6.65726 124.234 6.37896C124.65 6.10065 125.14 5.96045 125.724 5.96045C126.308 5.96045 126.801 6.10274 127.203 6.38523C127.607 6.66773 127.889 7.05275 128.055 7.54031H128.145C128.335 7.06112 128.66 6.67819 129.114 6.39151C129.57 6.10483 130.11 5.96254 130.735 5.96254Z"
								fill="#fff"
							/>
						</svg>
					</div>
					<div className="lpc-footer-nav-container">
						<details name="footer-nav">
							<summary>
								<div className="lpc-footer-nav-heading">
									{ __( 'Products', __i18n_text_domain__ ) }
								</div>
								<ChevronDown />
							</summary>
							<ul>
								<li>
									<a href={ localizeUrl( 'https://wordpress.com/hosting/' ) } target="_self">
										{ __( 'WordPress Hosting', __i18n_text_domain__ ) }
									</a>
								</li>
								<li>
									<a href={ localizeUrl( 'https://wordpress.com/for-agencies/' ) } target="_self">
										{ __( 'WordPress for Agencies', __i18n_text_domain__ ) }
									</a>
								</li>
								<li>
									<a href={ localizeUrl( 'https://wordpress.com/affiliates/' ) } target="_self">
										{ __( 'Become an Affiliate', __i18n_text_domain__ ) }
									</a>
								</li>
								<li>
									<a href={ localizeUrl( 'https://wordpress.com/domains/' ) } target="_self">
										{ __( 'Domain Names', __i18n_text_domain__ ) }
									</a>
								</li>
								<li>
									<a
										href={ localizeUrl( 'https://wordpress.com/ai-website-builder/' ) }
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
										href={ localizeUrl( 'https://wordpress.com/website-design-service/' ) }
										target="_self"
									>
										{ __( 'Website Design Services', __i18n_text_domain__ ) }
									</a>
								</li>
								<li>
									<a
										href={ localizeUrl( 'https://developer.wordpress.com/studio/' ) }
										target="_self"
										data-is_external="1"
									>
										<span className="lp-link-chevron-external">
											{ __( 'WordPress Studio', __i18n_text_domain__ ) }
										</span>
									</a>
								</li>
								<li>
									<a
										href="https://wpvip.com/wordpress-vip-agile-content-platform/?utm_source=WordPresscom&utm_medium=automattic_referral&utm_campaign=footer"
										target="_self"
										data-is_external="1"
									>
										<span className="lp-link-chevron-external">
											{ __( 'Enterprise WordPress', __i18n_text_domain__ ) }
										</span>
									</a>
								</li>
							</ul>
						</details>
						<details name="footer-nav">
							<summary>
								<div className="lpc-footer-nav-heading">
									{ __( 'Features', __i18n_text_domain__ ) }
								</div>
								<ChevronDown />
							</summary>
							<ul>
								<li>
									<a href={ localizeUrl( 'https://wordpress.com/features/' ) } target="_self">
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
										href={ localizeUrl( 'https://wordpress.com/plugins', locale, isLoggedIn ) }
										target="_self"
									>
										{ __( 'WordPress Plugins', __i18n_text_domain__ ) }
									</a>
								</li>
								<li>
									<a
										href={ localizeUrl( 'https://wordpress.com/patterns', locale, isLoggedIn ) }
										target="_self"
									>
										{ __( 'WordPress Patterns', __i18n_text_domain__ ) }
									</a>
								</li>
								<li>
									<a href={ localizeUrl( 'https://wordpress.com/ai/' ) } target="_self">
										{ __( 'WordPress AI Features', __i18n_text_domain__ ) }
									</a>
								</li>
								<li>
									<a href={ localizeUrl( 'https://wordpress.com/google/' ) } target="_self">
										{ __( 'Google Apps', __i18n_text_domain__ ) }
									</a>
								</li>
							</ul>
						</details>
						<details name="footer-nav">
							<summary>
								<div className="lpc-footer-nav-heading">
									{ __( 'Resources', __i18n_text_domain__ ) }
								</div>
								<ChevronDown />
							</summary>
							<ul>
								<li>
									<a href={ localizeUrl( 'https://wordpress.com/blog/' ) } target="_self">
										{ __( 'WordPress Blog', __i18n_text_domain__ ) }
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
									<a href={ localizeUrl( 'https://wordpress.com/discover' ) } target="_self">
										{ __( 'WordPress.com Reader', __i18n_text_domain__ ) }
									</a>
								</li>
								<li>
									<a href={ localizeUrl( 'https://wordpress.com/accessibility/' ) } target="_self">
										{ __( 'Accessibility', __i18n_text_domain__ ) }
									</a>
								</li>
							</ul>
						</details>
						<details name="footer-nav">
							<summary>
								<div className="lpc-footer-nav-heading">{ __( 'Help', __i18n_text_domain__ ) }</div>
								<ChevronDown />
							</summary>
							<ul>
								<li>
									<a href={ localizeUrl( 'https://wordpress.com/support/' ) } target="_self">
										{ __( 'Support Center', __i18n_text_domain__ ) }
									</a>
								</li>
								<li>
									<a href={ localizeUrl( 'https://wordpress.com/support/guides/' ) } target="_self">
										{ __( 'Guides', __i18n_text_domain__ ) }
									</a>
								</li>
								<li>
									<a
										href={ localizeUrl( 'https://wordpress.com/support/courses/' ) }
										target="_self"
									>
										{ __( 'Courses', __i18n_text_domain__ ) }
									</a>
								</li>
								<li>
									<a href={ localizeUrl( 'https://wordpress.com/forums/' ) } target="_self">
										{ __( 'Forums', __i18n_text_domain__ ) }
									</a>
								</li>
								<li>
									<a
										href={ localizeUrl( 'https://wordpress.com/support/contact/' ) }
										target="_self"
									>
										{ __( 'Contact', __i18n_text_domain__ ) }
									</a>
								</li>
								<li>
									<a
										href={ localizeUrl( 'https://developer.wordpress.com/' ) }
										target="_self"
										data-is_external="1"
									>
										<span className="lp-link-chevron-external">
											{ __( 'Developer Resources', __i18n_text_domain__ ) }
										</span>
									</a>
								</li>
							</ul>
						</details>
						<details name="footer-nav">
							<summary>
								<div className="lpc-footer-nav-heading">
									{ __( 'Company', __i18n_text_domain__ ) }
								</div>
								<ChevronDown />
							</summary>
							<ul>
								<li>
									<a href={ localizeUrl( 'https://wordpress.com/about/' ) } target="_self">
										{ __( 'About', __i18n_text_domain__ ) }
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
						</details>
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
									defaultValue={ currentLocaleKey }
								>
									<option value={ currentLocaleKey } disabled>
										{ currentLanguageName }
									</option>
									{ languageEntries
										.filter( ( [ key ] ) => key !== currentLocaleKey )
										.map( ( option ) => {
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
										className="lp-app-button lp-app-button--type-app-store"
										href="https://apps.apple.com/us/app/jetpack-for-wordpress/id1565481562"
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
								<li>
									<a
										className="lp-app-button lp-app-button--type-google-play"
										href="https://play.google.com/store/apps/details?id=com.jetpack.android"
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
							</ul>
						</div>

						<div className="lp-footer-social-media">
							<h2 className="lp-hidden">{ __( 'Social Media', __i18n_text_domain__ ) }</h2>
							<ul className="lp-footer-social-icons">
								<li>
									<a
										href="https://www.facebook.com/WordPresscom/"
										title="WordPress.com on Facebook"
									>
										<span className="lp-hidden">
											{ __( 'WordPress.com on Facebook', __i18n_text_domain__ ) }
										</span>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											className="lp-icon"
											width="24"
											height="24"
											aria-hidden="true"
										>
											<path d="M12 2C6.5 2 2 6.5 2 12c0 5 3.7 9.1 8.4 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7C18.3 21.1 22 17 22 12c0-5.5-4.5-10-10-10" />
										</svg>
									</a>
								</li>
								<li>
									<a href="https://x.com/wordpressdotcom" title="WordPress.com on X (Twitter)">
										<span className="lp-hidden">
											{ __( 'WordPress.com on X (Twitter)', __i18n_text_domain__ ) }
										</span>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											className="lp-icon"
											width="24"
											height="24"
											aria-hidden="true"
										>
											<path d="M13.982 10.622 20.54 3h-1.554l-5.693 6.618L8.745 3H3.5l6.876 10.007L3.5 21h1.554l6.012-6.989L15.868 21h5.245zm-2.128 2.474-.697-.997-5.543-7.93H8l4.474 6.4.697.996 5.815 8.318h-2.387z" />
										</svg>
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
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											className="lp-icon"
											width="24"
											height="24"
											aria-hidden="true"
										>
											<path d="M12 4.622c2.403 0 2.688.009 3.637.052.877.04 1.354.187 1.671.31.42.163.72.358 1.035.673s.51.615.673 1.035c.123.317.27.794.31 1.671.043.949.052 1.234.052 3.637s-.009 2.688-.052 3.637c-.04.877-.187 1.354-.31 1.671-.163.42-.358.72-.673 1.035s-.615.51-1.035.673c-.317.123-.794.27-1.671.31-.949.043-1.233.052-3.637.052s-2.688-.009-3.637-.052c-.877-.04-1.354-.187-1.671-.31a2.8 2.8 0 0 1-1.035-.673 2.8 2.8 0 0 1-.673-1.035c-.123-.317-.27-.794-.31-1.671-.043-.949-.052-1.234-.052-3.637s.009-2.688.052-3.637c.04-.877.187-1.354.31-1.671.163-.42.358-.72.673-1.035s.615-.51 1.035-.673c.317-.123.794-.27 1.671-.31.949-.043 1.234-.052 3.637-.052M12 3c-2.444 0-2.751.01-3.711.054-.958.044-1.612.196-2.184.418a4.4 4.4 0 0 0-1.594 1.039c-.5.5-.808 1.002-1.038 1.594-.223.572-.375 1.226-.419 2.184C3.01 9.249 3 9.556 3 12s.01 2.751.054 3.711c.044.958.196 1.612.418 2.185.23.592.538 1.094 1.038 1.594s1.002.808 1.594 1.038c.572.222 1.227.375 2.185.418.96.044 1.267.054 3.711.054s2.751-.01 3.711-.054c.958-.044 1.612-.196 2.185-.418a4.4 4.4 0 0 0 1.594-1.038c.5-.5.808-1.002 1.038-1.594.222-.572.375-1.227.418-2.185.044-.96.054-1.267.054-3.711s-.01-2.751-.054-3.711c-.044-.958-.196-1.612-.418-2.185A4.4 4.4 0 0 0 19.49 4.51c-.5-.5-1.002-.808-1.594-1.038-.572-.222-1.227-.375-2.185-.418C14.751 3.01 14.444 3 12 3m0 4.378a4.622 4.622 0 1 0 0 9.244 4.622 4.622 0 0 0 0-9.244M12 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6m4.804-8.884a1.08 1.08 0 1 0 .001 2.161 1.08 1.08 0 0 0-.001-2.161" />
										</svg>
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
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											className="lp-icon"
											width="24"
											height="24"
											aria-hidden="true"
										>
											<path d="M21.8 8.001s-.195-1.378-.795-1.985c-.76-.797-1.613-.801-2.004-.847-2.799-.202-6.997-.202-6.997-.202h-.009s-4.198 0-6.997.202c-.39.047-1.242.051-2.003.847-.6.607-.795 1.985-.795 1.985S2 9.62 2 11.238v1.517c0 1.618.2 3.237.2 3.237s.195 1.378.795 1.985c.761.797 1.76.771 2.205.855 1.6.153 6.8.201 6.8.201s4.203-.006 7.001-.209c.391-.047 1.243-.051 2.004-.847.6-.607.795-1.985.795-1.985s.2-1.618.2-3.237v-1.517c0-1.618-.2-3.237-.2-3.237M9.935 14.594l-.001-5.62 5.404 2.82z" />
										</svg>
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
					<a
						className="lp-link-work"
						href="https://automattic.com/work-with-us/"
						data-is_external="1"
					>
						<span className="lp-link-chevron-external">
							{ __( 'Work With Us', __i18n_text_domain__ ) }
						</span>
					</a>
				</div>
				<a
					className="lp-link-work-m"
					href="https://automattic.com/work-with-us/"
					data-is_external="1"
				>
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

	useIsomorphicEffect( () => {
		const mql = window.matchMedia( '(max-width: 1140px)' );

		const updateDetails = () => {
			const footer = document.getElementById( 'lpc-footer-nav' );
			if ( ! footer ) {
				return;
			}

			const details = footer.querySelectorAll< HTMLDetailsElement >(
				'.lpc-footer-nav-container > details'
			);

			if ( mql.matches ) {
				details.forEach( ( d ) => {
					d.removeAttribute( 'open' );
					d.setAttribute( 'name', 'footer-nav' );
				} );
			} else {
				details.forEach( ( d ) => {
					d.setAttribute( 'open', '' );
					d.removeAttribute( 'name' );
				} );
			}
		};

		updateDetails();
		mql.addEventListener( 'change', updateDetails );

		return () => {
			mql.removeEventListener( 'change', updateDetails );
		};
	}, [] );

	return (
		<PureUniversalNavbarFooter
			locale={ locale }
			isLoggedIn={ isLoggedIn }
			currentRoute={ pathNameWithoutLocale }
			additionalCompanyLinks={ additionalCompanyLinks }
			onLanguageChange={ onLanguageChange }
			localizeUrl={ localizeUrl }
			automatticBranding={ automatticBranding }
		/>
	);
};

export default UniversalNavbarFooter;
