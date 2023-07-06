import { ColorPaletteVariations, FontPairingVariations } from '@automattic/global-styles';
import { useTranslate } from 'i18n-calypso';
import { useSiteGlobalStylesStatus } from 'calypso/state/sites/hooks/use-site-global-styles-status';
import { MAIN_ITEMS } from '../constants';
import PatternListPanel from '../pattern-list-panel';
import { Pattern, Category } from '../types';
import Panel from './panel';
import type { GlobalStylesObject } from '@automattic/global-styles';

export type SidebarPanelProps = {
	siteId: number | string;
	stylesheet: string;
	categories: Category[];
	patternsMapByCategory: { [ key: string ]: Pattern[] };
	selectedMainItem: string | null;
	selectedHeader: Pattern | null;
	selectedFooter: Pattern | null;
	selectedColorPaletteVariation: GlobalStylesObject | null;
	selectedFontPairingVariation: GlobalStylesObject | null;
	onPatternSelect: (
		type: string,
		selectedPattern: Pattern | null,
		selectedCategory: string | null
	) => void;
	onScreenColorsSelect: ( colorPaletteVariation: GlobalStylesObject | null ) => void;
	onScreenFontsSelect: ( fontPairingVariation: GlobalStylesObject | null ) => void;
};

const SidebarPanel = ( {
	siteId,
	stylesheet,
	categories,
	patternsMapByCategory,
	selectedMainItem,
	selectedHeader,
	selectedFooter,
	selectedColorPaletteVariation,
	selectedFontPairingVariation,
	onPatternSelect,
	onScreenColorsSelect,
	onScreenFontsSelect,
}: SidebarPanelProps ) => {
	const translate = useTranslate();
	const { shouldLimitGlobalStyles } = useSiteGlobalStylesStatus( siteId );

	// Get props for selected main item
	const getSelectedPattern = () => {
		if ( MAIN_ITEMS.HEADER === selectedMainItem ) {
			return selectedHeader;
		}
		if ( MAIN_ITEMS.FOOTER === selectedMainItem ) {
			return selectedFooter;
		}
		return null;
	};

	const getLabel = () => {
		if ( MAIN_ITEMS.HEADER === selectedMainItem ) {
			return translate( 'Header' );
		}
		if ( MAIN_ITEMS.FOOTER === selectedMainItem ) {
			return translate( 'Footer' );
		}
		if ( MAIN_ITEMS.COLOR_PALETTES === selectedMainItem ) {
			return translate( 'Colors' );
		}
		if ( MAIN_ITEMS.FONT_PAIRINGS === selectedMainItem ) {
			return translate( 'Fonts' );
		}
	};

	const getDescription = () => {
		if ( MAIN_ITEMS.HEADER === selectedMainItem ) {
			return translate(
				'The header appears at the top of every page, with a site name and navigation.'
			);
		}
		if ( MAIN_ITEMS.FOOTER === selectedMainItem ) {
			return translate(
				'The footer appears at the bottom of a site and shows useful links and contact information.'
			);
		}
		if ( MAIN_ITEMS.COLOR_PALETTES === selectedMainItem ) {
			return translate(
				'Choose from our curated color palettes when you upgrade to the Premium plan or above.'
			);
		}
		if ( MAIN_ITEMS.FONT_PAIRINGS === selectedMainItem ) {
			return translate(
				'Choose from our curated font pairings when you upgrade to the Premium plan or above.'
			);
		}
	};

	// Render
	if ( ! selectedMainItem ) {
		return null;
	}

	// Patterns
	if ( [ MAIN_ITEMS.HEADER, MAIN_ITEMS.FOOTER ].includes( selectedMainItem ) ) {
		return (
			<PatternListPanel
				label={ getLabel() }
				description={ getDescription() }
				onSelect={ ( selectedPattern: Pattern | null ) =>
					onPatternSelect( selectedMainItem, selectedPattern, selectedMainItem )
				}
				categories={ categories }
				selectedPattern={ getSelectedPattern() }
				selectedCategory={ selectedMainItem }
				patternsMapByCategory={ patternsMapByCategory }
			/>
		);
	}

	// Styles
	if ( MAIN_ITEMS.COLOR_PALETTES === selectedMainItem ) {
		return (
			<Panel label={ getLabel() } description={ getDescription() }>
				<ColorPaletteVariations
					siteId={ siteId }
					stylesheet={ stylesheet }
					selectedColorPaletteVariation={ selectedColorPaletteVariation }
					onSelect={ onScreenColorsSelect }
					limitGlobalStyles={ shouldLimitGlobalStyles }
				/>
			</Panel>
		);
	}

	if ( MAIN_ITEMS.FONT_PAIRINGS === selectedMainItem ) {
		return (
			<Panel label={ getLabel() } description={ getDescription() }>
				<FontPairingVariations
					siteId={ siteId }
					stylesheet={ stylesheet }
					selectedFontPairingVariation={ selectedFontPairingVariation }
					onSelect={ onScreenFontsSelect }
					limitGlobalStyles={ shouldLimitGlobalStyles }
				/>
			</Panel>
		);
	}

	return null;
};

export default SidebarPanel;
