import { ExternalLink } from '@wordpress/components';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import { type FC, useMemo } from 'react';
import { useSelector } from 'calypso/state';
import { getThemeSoftwareSet } from 'calypso/state/themes/selectors';

interface StaticSettings {
	/** Name field is a label for the bundle name, which can be used isolated or in the middle of a sentence. Many times used as "{name} theme". */
	name: string;
	iconComponent: FC;
	color: string;
}

interface StaticSettingsMap {
	[ key: string ]: StaticSettings;
}

interface BundleSettings extends StaticSettings {
	designPickerBadgeTooltip: string;
	bannerUpsellDescription: string;
	bundledPluginMessage: TranslateResult;
}

/**
 * This is the static settings for bundles. Dynamic parts, should be added in
 * the `switch` of the `useBundleSettings`.
 */
const staticSettings: StaticSettingsMap = {
	'woo-on-plans': {
		name: 'WooCommerce',
		iconComponent: () => (
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
				<path
					fill="currentColor"
					d="M4.05944 6.19631C3.82116 6.19642 3.58526 6.24356 3.36524 6.33504C3.14523 6.42652 2.94544 6.56053 2.77733 6.72939C2.60922 6.89826 2.47611 7.09864 2.38562 7.31906C2.29512 7.53949 2.24904 7.7756 2.25 8.01388V14.0727C2.25 15.0769 3.06331 15.8902 4.06756 15.8902H11.5856L15.0217 17.8037L14.2401 15.8902H19.9324C20.9367 15.8902 21.75 15.0778 21.75 14.0727V8.01388C21.75 7.00963 20.9375 6.19631 19.9324 6.19631H4.05944ZM10.6244 7.2615C10.7821 7.26313 10.9267 7.31919 11.0591 7.424C11.1304 7.47778 11.1894 7.54623 11.232 7.62471C11.2746 7.7032 11.2999 7.78991 11.3061 7.879C11.3168 8.0113 11.2891 8.14386 11.2265 8.26088C10.9161 8.83531 10.661 9.7997 10.4538 11.1388C10.2539 12.4388 10.1824 13.4511 10.2304 14.1767C10.2466 14.3758 10.2141 14.5504 10.1345 14.7024C10.0952 14.7829 10.0355 14.8517 9.9614 14.902C9.8873 14.9523 9.8013 14.9824 9.712 14.9892C9.5048 15.0054 9.2895 14.9096 9.0823 14.6951C8.3405 13.937 7.75062 12.8052 7.32 11.2988C6.93076 12.0606 6.54805 12.8258 6.17194 13.5941C5.70231 14.496 5.30337 14.9575 4.96862 14.9819C4.75331 14.9981 4.5705 14.8145 4.41044 14.4318C4.00419 13.3869 3.56544 11.3703 3.095 8.38031C3.07063 8.17313 3.11125 7.99031 3.22256 7.8465C3.33387 7.69538 3.50206 7.61575 3.72469 7.5995C4.13094 7.567 4.3625 7.75875 4.41856 8.17313C4.66556 9.8396 4.93694 11.2509 5.22375 12.4063L6.96981 9.08313C7.12906 8.78006 7.32812 8.62 7.56781 8.60456C7.918 8.58019 8.13331 8.80363 8.22106 9.2741C8.42094 10.3344 8.67606 11.2354 8.97831 12.0008C9.1855 9.9761 9.5365 8.51681 10.0305 7.61575C10.1507 7.39313 10.3254 7.281 10.557 7.26556C10.5797 7.26338 10.6025 7.26229 10.6252 7.26231L10.6244 7.2615ZM13.6583 8.12519C13.794 8.12519 13.937 8.14144 14.0889 8.17394C14.6471 8.29256 15.0769 8.59644 15.3646 9.0978C15.6197 9.5284 15.7464 10.0468 15.7464 10.6683C15.7464 11.4898 15.5401 12.2389 15.1249 12.9246C14.6471 13.7217 14.0247 14.1206 13.2521 14.1206C13.1164 14.1206 12.9726 14.1044 12.8214 14.0727C12.2551 13.9533 11.8326 13.6502 11.5458 13.1481C11.2907 12.7093 11.1631 12.1836 11.1631 11.5694C11.1631 10.7488 11.3703 9.9988 11.7847 9.3212C12.2714 8.52413 12.8929 8.12519 13.6583 8.12519ZM18.6568 8.12519C18.7925 8.12519 18.9355 8.14144 19.0874 8.17394C19.6529 8.29256 20.0754 8.59644 20.3631 9.0978C20.6182 9.5284 20.7449 10.0468 20.7449 10.6683C20.7449 11.4898 20.5386 12.2389 20.1234 12.9246C19.6456 13.7217 19.0233 14.1206 18.2506 14.1206C18.1149 14.1206 17.9711 14.1044 17.8199 14.0727C17.2536 13.9533 16.8311 13.6502 16.5443 13.1481C16.2892 12.7093 16.1616 12.1836 16.1616 11.5694C16.1616 10.7488 16.3688 9.9988 16.7832 9.3212C17.2699 8.52413 17.8914 8.12519 18.6568 8.12519ZM13.6949 9.4618C13.4454 9.4601 13.2025 9.6251 12.9726 9.9671C12.7688 10.2515 12.625 10.5744 12.5501 10.9161C12.5094 11.0989 12.494 11.298 12.494 11.4979C12.494 11.7286 12.5427 11.9764 12.6378 12.2234C12.7572 12.5338 12.9165 12.702 13.1083 12.7418C13.3073 12.7816 13.5226 12.6931 13.7542 12.4859C14.0491 12.2234 14.2482 11.8326 14.3595 11.3061C14.4001 11.1233 14.4156 10.9243 14.4156 10.7163C14.4129 10.4677 14.3644 10.2217 14.2726 9.9907C14.1523 9.6803 13.9931 9.5129 13.8013 9.4731C13.7663 9.4661 13.7306 9.4623 13.6949 9.4618ZM18.6934 9.4618C18.4439 9.4601 18.201 9.6251 17.9711 9.9671C17.7673 10.2515 17.6235 10.5744 17.5486 10.9161C17.5088 11.0989 17.4925 11.298 17.4925 11.4979C17.4925 11.7286 17.5412 11.9764 17.6363 12.2234C17.7557 12.5338 17.9158 12.702 18.1068 12.7418C18.3058 12.7816 18.5211 12.6931 18.7527 12.4859C19.0476 12.2234 19.2467 11.8326 19.358 11.3061C19.3905 11.1233 19.4149 10.9243 19.4149 10.7163C19.4119 10.4676 19.3632 10.2216 19.2711 9.9907C19.1508 9.6803 18.9916 9.5129 18.7998 9.4731C18.7648 9.4661 18.7291 9.4623 18.6934 9.4618Z"
				/>
			</svg>
		),
		color: '#7f54b3',
	},
};

/**
 * Hook to get the bundle settings for a given theme.
 * If the theme doesn't have a sotfware set defined, it returns `null`.
 */
const useBundleSettings = ( themeId: string ): BundleSettings | null => {
	const themeSoftwareSet = useSelector( ( state ) => getThemeSoftwareSet( state, themeId ) );
	const translate = useTranslate();

	const bundleSettings = useMemo( () => {
		// Currently, it always get the first software set. In the future, the whole applications can be enhanced to support multiple ones.
		const themeSoftware = themeSoftwareSet[ 0 ];

		switch ( themeSoftware ) {
			case 'woo-on-plans':
				return {
					...staticSettings[ themeSoftware ],
					designPickerBadgeTooltip: translate(
						'This theme comes bundled with WooCommerce, the best way to sell online.'
					),
					bannerUpsellDescription: translate(
						'This theme comes bundled with the WooCommerce plugin. Upgrade to a Business plan to select this theme and unlock all its features.'
					),
					bundledPluginMessage: translate(
						'This theme comes bundled with {{link}}WooCommerce{{/link}} plugin.',
						{
							components: {
								link: <ExternalLink children={ null } href="https://woocommerce.com/" />,
							},
						}
					),
				};

			default:
				return null;
		}
	}, [ translate, themeSoftwareSet ] );

	return bundleSettings;
};

export default useBundleSettings;
