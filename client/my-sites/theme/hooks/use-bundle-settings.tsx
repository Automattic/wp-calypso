import { ExternalLink } from '@wordpress/components';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import { type FC, useMemo } from 'react';
import { useSelector } from 'calypso/state';
import { getThemeSoftwareSet } from 'calypso/state/themes/selectors';

interface BundleSettings {
	/** Name field is a label for the bundle name, which can be used isolated or in the middle of a sentence. Many times used as "{name} theme". */
	name: string;
	iconComponent: FC;
	color: string;
	designPickerBadgeTooltip: string;
	bannerUpsellDescription: string;
	bundledPluginMessage: TranslateResult;
	checkForActivePlugins: string[];
}

export type BundleSettingsHookReturn = BundleSettings | null;

const WooOnPlansIcon = () => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<path
			fill="currentColor"
			d="M3.85585 6.5C3.61146 6.50011 3.36951 6.54846 3.14385 6.64229C2.9182 6.73611 2.71329 6.87356 2.54087 7.04675C2.36845 7.21995 2.23192 7.42547 2.13911 7.65154C2.04629 7.87762 1.99903 8.11978 2.00002 8.36417V14.5783C2.00002 15.6083 2.83418 16.4424 3.86418 16.4424H11.575L15.0992 18.405L14.2975 16.4424H20.1358C21.1658 16.4424 22 15.6092 22 14.5783V8.36417C22 7.33417 21.1667 6.5 20.1358 6.5H3.85585ZM10.5891 7.5925C10.7509 7.59417 10.8992 7.65167 11.035 7.75917C11.1081 7.81433 11.1686 7.88453 11.2123 7.96502C11.256 8.04553 11.282 8.13446 11.2883 8.22583C11.2993 8.36153 11.2709 8.49749 11.2067 8.61751C10.8883 9.20667 10.6267 10.1958 10.4142 11.5692C10.2091 12.9025 10.1358 13.9408 10.185 14.685C10.2017 14.8892 10.1683 15.0683 10.0867 15.2242C10.0464 15.3068 9.98514 15.3773 9.90914 15.4289C9.83314 15.4805 9.74493 15.5114 9.65334 15.5183C9.44083 15.535 9.22001 15.4367 9.0075 15.2167C8.24668 14.4392 7.64167 13.2783 7.20001 11.7333C6.80079 12.5147 6.40827 13.2995 6.02251 14.0875C5.54084 15.0125 5.13167 15.4858 4.78834 15.5109C4.56751 15.5275 4.38001 15.3392 4.21585 14.9466C3.79918 13.875 3.34918 11.8067 2.86668 8.74C2.84169 8.52751 2.88335 8.34 2.99751 8.1925C3.11168 8.03751 3.28418 7.95583 3.51252 7.93917C3.92918 7.90583 4.16668 8.1025 4.22418 8.52751C4.47751 10.2367 4.75585 11.6842 5.05001 12.8692L6.84084 9.46081C7.00418 9.15 7.20834 8.98583 7.45417 8.97C7.81334 8.945 8.03417 9.17417 8.12417 9.65671C8.32918 10.7442 8.59084 11.6683 8.90084 12.4533C9.11334 10.3767 9.47334 8.88 9.98001 7.95583C10.1033 7.72751 10.2825 7.6125 10.52 7.59667C10.5433 7.59443 10.5667 7.59331 10.59 7.59333L10.5891 7.5925ZM13.7008 8.47834C13.84 8.47834 13.9867 8.495 14.1425 8.52834C14.715 8.65 15.1558 8.96167 15.4509 9.47589C15.7125 9.91753 15.8425 10.4492 15.8425 11.0867C15.8425 11.9292 15.6309 12.6975 15.205 13.4008C14.715 14.2183 14.0766 14.6275 13.2842 14.6275C13.145 14.6275 12.9975 14.6109 12.8425 14.5783C12.2616 14.4559 11.8283 14.145 11.5342 13.63C11.2725 13.18 11.1416 12.6408 11.1416 12.0109C11.1416 11.1692 11.3542 10.4 11.7792 9.70501C12.2784 8.88751 12.9158 8.47834 13.7008 8.47834ZM18.8275 8.47834C18.9667 8.47834 19.1133 8.495 19.2691 8.52834C19.8491 8.65 20.2825 8.96167 20.5775 9.47589C20.8392 9.91753 20.9691 10.4492 20.9691 11.0867C20.9691 11.9292 20.7575 12.6975 20.3317 13.4008C19.8416 14.2183 19.2034 14.6275 18.4109 14.6275C18.2717 14.6275 18.1242 14.6109 17.9691 14.5783C17.3883 14.4559 16.955 14.145 16.6608 13.63C16.3992 13.18 16.2683 12.6408 16.2683 12.0109C16.2683 11.1692 16.4808 10.4 16.9058 9.70501C17.405 8.88751 18.0425 8.47834 18.8275 8.47834ZM13.7384 9.84922C13.4825 9.84747 13.2333 10.0167 12.9975 10.3675C12.7885 10.6592 12.641 10.9903 12.5642 11.3408C12.5225 11.5283 12.5067 11.7325 12.5067 11.9375C12.5067 12.1741 12.5566 12.4283 12.6542 12.6816C12.7766 13 12.94 13.1725 13.1367 13.2133C13.3408 13.2541 13.5616 13.1634 13.7992 12.9509C14.1016 12.6816 14.3059 12.2808 14.42 11.7408C14.4616 11.5533 14.4775 11.3492 14.4775 11.1359C14.4748 10.8809 14.425 10.6286 14.3309 10.3917C14.2075 10.0733 14.0442 9.90163 13.8475 9.86081C13.8116 9.85363 13.775 9.84973 13.7384 9.84922ZM18.865 9.84922C18.6091 9.84747 18.36 10.0167 18.1242 10.3675C17.9152 10.6592 17.7677 10.9903 17.6909 11.3408C17.6501 11.5283 17.6333 11.7325 17.6333 11.9375C17.6333 12.1741 17.6833 12.4283 17.7808 12.6816C17.9033 13 18.0675 13.1725 18.2634 13.2133C18.4675 13.2541 18.6883 13.1634 18.9258 12.9509C19.2283 12.6816 19.4325 12.2808 19.5467 11.7408C19.58 11.5533 19.605 11.3492 19.605 11.1359C19.602 10.8808 19.552 10.6285 19.4575 10.3917C19.3342 10.0733 19.1709 9.90163 18.9742 9.86081C18.9383 9.85363 18.9016 9.84973 18.865 9.84922Z"
		/>
	</svg>
);

const useBundleSettings = ( themeSoftware?: string ): BundleSettingsHookReturn => {
	const translate = useTranslate();

	const bundleSettings = useMemo( () => {
		switch ( themeSoftware ) {
			case 'woo-on-plans':
				return {
					name: 'WooCommerce',
					iconComponent: WooOnPlansIcon,
					color: '#7f54b3',
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
					checkForActivePlugins: [ 'woocommerce' ],
				};

			default:
				return null;
		}
	}, [ translate, themeSoftware ] );

	return bundleSettings;
};

/**
 * Hook to get the bundle settings for a given theme.
 * If the theme doesn't have a sotfware set defined, it returns `null`.
 */
export const useBundleSettingsByTheme = ( themeId: string ): BundleSettingsHookReturn => {
	const themeSoftwareSet = useSelector( ( state ) => getThemeSoftwareSet( state, themeId ) );
	// Currently, it always get the first software set. In the future, the whole applications can be enhanced to support multiple ones.
	const themeSoftware = themeSoftwareSet[ 0 ];
	const bundleSettings = useBundleSettings( themeSoftware );

	return bundleSettings;
};

export default useBundleSettings;
