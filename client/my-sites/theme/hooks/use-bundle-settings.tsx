import { PLAN_BUSINESS, getPlan } from '@automattic/calypso-products';
import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { ExternalLink } from '@wordpress/components';
import i18n, { useTranslate, TranslateResult } from 'i18n-calypso';
import { type FC, useMemo } from 'react';
import { useSelector } from 'calypso/state';
import { getThemeSoftwareSet } from 'calypso/state/themes/selectors';

interface BundleSettings {
	/** Name field is a label for the bundle name, which can be used isolated or in the middle of a sentence. Many times used as "{name} theme". */
	name: string;
	/** Software name field is a label for the product name, which can be used isolated or in the middle of a sentence, like: "Installing {softwareName}" */
	softwareName: string;
	iconComponent: FC;
	color: string;
	designPickerBadgeTooltip: string;
	bannerUpsellDescription: string;
	bundledPluginMessage: TranslateResult;
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

const SenseiIcon = () => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<path
			fill="currentColor"
			d="M9.835 15.38c.3-.23.179-.474.6-.563-.02.194.146.391.251.563-.109-.367-.002-.536.08-.72.347-.785-.662-1.293-1.35-1.418.235-.164.399-.327.694-.355a2.377 2.377 0 0 0-1.058.23c-1.112.531-1.993-.523-1.41-1.48.31-.51.664-.519.982-.865.077.178.103.372.075.564a.919.919 0 0 0 .049-.664c-.104-.336-.4-.338-.456-.821-.012-.101-.105.056-.263-.077-.038-.032-.113-.09-.163-.064-.085.044-.18.008-.232.034-.083.041-.109-.045-.2.016-.16.107-.178-.013-.332.005-.193.023-.32.261-.43.144-.102-.108-.206.075-.28.075-.05 0-.311.317-.426.028-.086-.216-.28.206-.382.063-.033-.046-.123.108-.18-.044-.014-.035 0-.078-.108-.027-.215.099-.138-.06-.207-.144-.083-.103-.113-.103-.068-.27.036-.133-.019-.33.2-.364.055-.008.107-.005.184-.148.096-.18.231-.093.207-.175-.036-.119.143-.28.226-.355.11-.103.254-.252.306-.396a.63.63 0 0 1 .102-.141c.081-.084.105-.003.227-.045.088-.03.02.053.106-.07.028-.038.105-.001.19-.039.259-.112.283-.11.347-.371.012-.05.025-.088.08-.083.109.01.134-.052.2-.05.061.001.083-.03.115-.068.18-.216.277-.055.357-.072.06-.012.022-.142.184-.102.23.057.155-.05.303-.015.174.041.186.19.306.225.143.042.211.198.307.196.337-.005.235.23.448.323-.16-.161.012-.421-.352-.455-.08-.007-.11-.127-.23-.183-.146-.067-.13-.21-.394-.27.068-.04.089.005.13-.073.058-.11.09-.046.113-.113.02-.063.006-.099.165-.155.165-.06.325-.195.472-.188.13.006.185-.08.177-.19-.008-.112-.033-.267.222-.22.153.029.15.003.15-.1-.002-.102.04-.165.174-.16.098.002.194-.003.231-.117.03-.091.207-.114.302-.148.317-.114.361.05.447-.095.07-.117.196-.317.337-.175.028.029.054.05.15-.056.08-.088.27-.2.337-.048.027.06.086.121.138.044a.08.08 0 0 1 .053-.039c.05-.01.079-.024.104-.036.218-.101.314-.095.213.125-.142.316.792-.192.532.151-.095.126.538.197.63.254.05.032.048.059.144.077.271.05.267.026.284.243.007.098.107.043.107.168 0 .535.472.266.549.399.012.022.032.042.079.042.149 0 .157-.03.224.089.027.047.05.072.127.096.12.037.112.05.068.138-.054.104.03.102.138.112.1.01.148.062.216.138.11.122.284.156.43.227.084.04.002.14.143.243.104.077.156.066.016.165-.59.418.22.305.446.694.051.087.118.195.216.295.225.23.1.293.221.437.07.083.015.063.13.137.272.175-.105.292-.319.212-.097-.035-.166-.085-.147-.025.016.049-.01.083-.052.12-.125.112.123.068.181.06.181-.025.664-.076.66.093-.005.22.136.27.25.284.185.024.238.057.34.226.092.152.145.07.288.205.097.093.217.258.02.282-.047.005-.099 0-.12.017a.411.411 0 0 1-.14.066c-.295.09.14.136.246.113.093-.02.209-.05.3-.027.057.015.062.08.244.107.06.01.036.099.006.16-.104.214.191.1.16.263-.017.093.11.245-.067.248-.057.001-.117-.015-.115.034.004.105-.165-.03-.317.115-.056.054-.19.092-.272-.009-.032-.038-.07-.069-.218-.023-.144.046-.242.204-.306-.04-.017-.064-.05-.065-.142-.097-.125-.043-.114-.258-.297-.12a.24.24 0 0 1-.214.039c-.144-.037-.303.012-.317-.096-.021-.179-.191-.305-.377-.296-.147.008-.278.034-.355-.137.057.195.207.208.382.208.144 0 .23.075.255.225.045.265.204.099.406.223.1.06.17.159.21.273.042.118.37-.024.282.258-.037.122-.107.168-.242.266-.4.294-.5.004-.618.239-.062.121-.063.031-.196.09-.22.098-.36-.128-.522-.045-.182.094-.168-.08-.352.037-.152.097-.308-.074-.38.192-.063.227-.322.232-.44.11-.189-.194-.132.229-.362.054-.123-.091-.213.043-.392.045-.33.005-.489-.282-.65-.107-.192.206-.331-.032-.334-.242-.003-.216-.777-.144-1.185-.256-.225-.062-.932.013-.702-.35-.372.39.456.366.682.455.136.053.245.095.377.114.13.296.214.617.227 1.007.043-.214.053-.433.028-.649-.043-.383.242.19.276.272.184.45-.022 1.278-.488 1.526a2.957 2.957 0 0 0-.562-.99c.256.392.616 1.192.327 1.65a1.023 1.023 0 0 1-.55-.483c.077.333.413.702.818.58.707-.213.704.233 1.641.307.682.111 1.654 0 2.118.037.254.02 1.32.197 1.315.465-.02 1.105-.438 1.164-1.539 1.268-.64.06-1.134.085-1.823.11-1.54.058-3.391.06-4.868 0-.724-.03-1.072-.036-1.841-.137-.769-.1-1.19-.363-1.178-1.187.005-.304.905-.594 1.2-.628.347-.039.901.005 1.405-.116.527-.127.747-.21 1.135-.508Zm5.347-6.052c-.167-.042-.051-.138-.339-.014-.17.073-.194-.13-.365-.094-.172.036-.242-.125-.499-.166-.318-.05-.088-.133-.592-.032-.097.02-.179-.09-.481-.052-.355.046-.23.084-.445-.115-.272-.251-.488-.082-.767-.184.216.166.368.019.622.221-.242.138-.523.802-.962.844.478.107.709.354 1.148.413.504.068.882.118 1.151.531.301.463.44.196.874.168.275-.017.282-.185.328-.362.063-.245.126-.256.31-.289.213-.037.163-.092.107-.156-.15-.172.019-.207.146-.244.222-.064.042-.075.042-.166-.278-.09-.063-.217.092-.273.169.105.242.087.317.073.109-.021.181.03.273-.028-.135.014-.163-.037-.278-.02-.051.007-.112.01-.219-.054-.18-.107-.27.048-.463 0Zm-2.28 1.64-1.09-.545c-1.316-.657-1.915.313-2.337 1.376l-.766.73c.549-.338.996-.714 1.574-.71.092 0 1.516.484 1.286-.092-.04-.104.09-.052.125-.201.04-.17.055-.141.195-.033.089.069.211.113.174-.048-.017-.072-.04-.137.28-.004.15.062.095-.064.303-.09.29-.034.228-.31.364-.349.076-.022.152.058.295-.077.05-.046.11-.089.232-.057-.143-.073-.22-.014-.292.03-.146.089-.204-.037-.343.07Zm-2.23-1.923c.16-.02.32-.036.482-.046a.13.13 0 0 0 .074-.06.111.111 0 0 0 .007-.09.268.268 0 0 1 .147-.206l-.002-.003c-.258.001-.466.1-.73.211-.052.022-.024.111-.118.213a.26.26 0 0 1-.201.235.136.136 0 0 0-.09.046.113.113 0 0 0-.026.092.252.252 0 0 1-.277.061c-.2-.077-.35-.065-.448.036a.39.39 0 0 1 .398.014c.134.066.3.031.39-.082a.132.132 0 0 1 .126-.098.421.421 0 0 0 .268-.323Z"
		/>
	</svg>
);

export function useBundleSettings( themeSoftware?: string ): BundleSettingsHookReturn {
	const translate = useTranslate();
	const isEnglishLocale = useIsEnglishLocale();
	const businessPlanName = getPlan( PLAN_BUSINESS )?.getTitle() || '';

	const bundleSettings = useMemo( () => {
		switch ( themeSoftware ) {
			case 'woo-on-plans':
				return {
					name: 'WooCommerce',
					softwareName: 'WooCommerce',
					iconComponent: WooOnPlansIcon,
					color: '#7f54b3',
					designPickerBadgeTooltip: translate(
						'This theme comes bundled with WooCommerce, the best way to sell online.'
					),
					bannerUpsellDescription:
						isEnglishLocale ||
						i18n.hasTranslation(
							'This theme comes bundled with the WooCommerce plugin. Upgrade to a %(businessPlanName)s plan to select this theme and unlock all its features.'
						)
							? ( translate(
									'This theme comes bundled with the WooCommerce plugin. Upgrade to a %(businessPlanName)s plan to select this theme and unlock all its features.',
									{ args: { businessPlanName } }
							  ) as string )
							: translate(
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

			case 'sensei':
				return {
					name: 'Sensei LMS',
					softwareName: 'Sensei LMS',
					iconComponent: SenseiIcon,
					color: '#43AF99',
					designPickerBadgeTooltip: translate(
						'This theme comes bundled with Sensei. Create and sell courses that your students will love.'
					),
					bannerUpsellDescription: translate(
						'This theme comes bundled with the Sensei plugin. Upgrade to a Business plan to select this theme and unlock all its features.'
					),
					bundledPluginMessage: translate(
						'This theme comes bundled with {{link}}Sensei{{/link}} plugin.',
						{
							components: {
								link: <ExternalLink children={ null } href="https://senseilms.com/" />,
							},
						}
					),
				};

			default:
				return null;
		}
	}, [ themeSoftware, translate, isEnglishLocale, businessPlanName ] );

	return bundleSettings;
}

/**
 * Hook to get the bundle settings for a given theme.
 * If the theme doesn't have a sotfware set defined, it returns `null`.
 */
export function useBundleSettingsByTheme( themeId: string ): BundleSettingsHookReturn {
	const themeSoftwareSet = useSelector( ( state ) => getThemeSoftwareSet( state, themeId ) );
	// Currently, it always get the first software set. In the future, the whole applications can be enhanced to support multiple ones.
	const themeSoftware = themeSoftwareSet[ 0 ];
	const bundleSettings = useBundleSettings( themeSoftware );

	return bundleSettings;
}
