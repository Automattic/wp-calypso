import { isEnabled } from '@automattic/calypso-config';
import { isDefaultGlobalStylesVariationSlug } from '@automattic/design-picker';
import {
	GlobalStylesVariations,
	ColorPaletteVariations,
	FontPairingVariations,
} from '@automattic/global-styles';
import { color, styles, typography } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { COLOR_VARIATIONS_BLOCK_LIST } from '../constants';
import type { StyleVariation } from '@automattic/design-picker/src/types';
import type { GlobalStylesObject } from '@automattic/global-styles';
import type { NavigatorScreenObject } from '@automattic/onboarding';

interface Props {
	siteId: number;
	stylesheet: string;
	isVirtual?: boolean;
	limitGlobalStyles?: boolean;
	globalStylesInPersonalPlan: boolean;
	variations?: StyleVariation[];
	splitDefaultVariation: boolean;
	selectedVariation?: StyleVariation;
	selectedColorVariation: GlobalStylesObject | null;
	selectedFontVariation: GlobalStylesObject | null;
	onSelectVariation: ( variation: StyleVariation ) => void;
	onSelectColorVariation: ( variation: GlobalStylesObject | null ) => void;
	onSelectFontVariation: ( variation: GlobalStylesObject | null ) => void;
	onScreenSelect?: ( screenSlug: string ) => void;
	onScreenBack?: ( screenSlug: string ) => void;
	onScreenSubmit?: ( screenSlug: string ) => void;
}

const useScreens = ( {
	siteId,
	stylesheet,
	isVirtual,
	limitGlobalStyles,
	globalStylesInPersonalPlan,
	variations,
	splitDefaultVariation,
	selectedVariation,
	selectedColorVariation,
	selectedFontVariation,
	onSelectVariation,
	onSelectColorVariation,
	onSelectFontVariation,
	onScreenSelect,
	onScreenBack,
	onScreenSubmit,
}: Props ) => {
	const translate = useTranslate();

	return useMemo(
		() =>
			[
				variations &&
					variations.length > 0 && {
						slug: 'style-variations',
						checked: ! isDefaultGlobalStylesVariationSlug( selectedVariation?.slug ),
						icon: styles,
						label: translate( 'Styles' ),
						path: '/style-variations',
						content: (
							<div className="design-preview__sidebar-variations">
								<div className="design-preview__sidebar-variations-grid">
									<GlobalStylesVariations
										key="style-variations"
										globalStylesVariations={ variations as GlobalStylesObject[] }
										selectedGlobalStylesVariation={ selectedVariation as GlobalStylesObject }
										splitDefaultVariation={ splitDefaultVariation }
										displayFreeLabel={ splitDefaultVariation }
										showOnlyHoverViewDefaultVariation={ false }
										onSelect={ ( globalStyleVariation: GlobalStylesObject ) =>
											onSelectVariation( globalStyleVariation as StyleVariation )
										}
										globalStylesInPersonalPlan={ globalStylesInPersonalPlan }
									/>
								</div>
							</div>
						),
						actionText: translate( 'Save styles' ),
						onSelect: onScreenSelect,
						onBack: onScreenBack,
						onSubmit: onScreenSubmit,
					},
				variations &&
					variations.length === 0 &&
					// Disable Colors for themes that don't play well with them. See pbxlJb-4cl-p2 for more context.
					! isVirtual &&
					! COLOR_VARIATIONS_BLOCK_LIST.includes( stylesheet ) &&
					isEnabled( 'signup/design-picker-preview-colors' ) && {
						slug: 'color-palettes',
						checked: !! selectedColorVariation,
						icon: color,
						label: translate( 'Colors' ),
						path: '/color-palettes',
						title: translate( 'Colors' ),
						description: translate(
							'Discover your ideal color blend, from free to custom styles.'
						),
						content: (
							<div className="design-preview__sidebar-variations">
								<ColorPaletteVariations
									key="color-variations"
									siteId={ siteId }
									stylesheet={ stylesheet }
									limitGlobalStyles={ limitGlobalStyles }
									selectedColorPaletteVariation={ selectedColorVariation }
									onSelect={ onSelectColorVariation }
								/>
							</div>
						),
						actionText: translate( 'Save colors' ),
						onSelect: onScreenSelect,
						onBack: onScreenBack,
						onSubmit: onScreenSubmit,
					},
				variations &&
					variations.length === 0 &&
					isEnabled( 'signup/design-picker-preview-fonts' ) && {
						slug: 'font-pairings',
						checked: !! selectedFontVariation,
						icon: typography,
						label: translate( 'Fonts' ),
						path: '/font-pairings',
						title: translate( 'Fonts' ),
						description: translate( 'Elevate your design with expertly curated font pairings.' ),
						content: (
							<div key="font-variations" className="design-preview__sidebar-variations">
								<FontPairingVariations
									siteId={ siteId }
									stylesheet={ stylesheet }
									limitGlobalStyles={ limitGlobalStyles }
									selectedFontPairingVariation={ selectedFontVariation }
									onSelect={ onSelectFontVariation }
								/>
							</div>
						),
						actionText: translate( 'Save fonts' ),
						onSelect: onScreenSelect,
						onBack: onScreenBack,
						onSubmit: onScreenSubmit,
					},
			].filter( Boolean ) as NavigatorScreenObject[],
		[
			variations,
			siteId,
			stylesheet,
			selectedVariation,
			selectedColorVariation,
			selectedFontVariation,
		]
	);
};

export default useScreens;
