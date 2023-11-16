import { ColorPaletteVariations } from '@automattic/global-styles';
import { useTranslate } from 'i18n-calypso';
import { useSiteGlobalStylesStatus } from 'calypso/state/sites/hooks/use-site-global-styles-status';
import Panel from './panel';
import type { GlobalStylesObject } from '@automattic/global-styles';

interface Props {
	siteId: number | string;
	stylesheet: string;
	selectedColorPaletteVariation: GlobalStylesObject | null;
	onSelect: ( colorPaletteVariation: GlobalStylesObject | null ) => void;
}

const ScreenColorPalettes = ( {
	siteId,
	stylesheet,
	selectedColorPaletteVariation,
	onSelect,
}: Props ) => {
	const { shouldLimitGlobalStyles } = useSiteGlobalStylesStatus( siteId );
	const translate = useTranslate();

	return (
		<Panel
			label={ translate( 'Colors' ) }
			description={ translate(
				'Find your perfect color style. Change the look and feel of your site in one click with our premium colors.'
			) }
		>
			<ColorPaletteVariations
				siteId={ siteId }
				stylesheet={ stylesheet }
				selectedColorPaletteVariation={ selectedColorPaletteVariation }
				onSelect={ onSelect }
				limitGlobalStyles={ shouldLimitGlobalStyles }
			/>
		</Panel>
	);
};

export default ScreenColorPalettes;
