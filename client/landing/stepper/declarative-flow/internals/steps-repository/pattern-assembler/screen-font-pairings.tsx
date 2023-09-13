import { FontPairingVariations } from '@automattic/global-styles';
import { useTranslate } from 'i18n-calypso';
import { useSiteGlobalStylesStatus } from 'calypso/state/sites/hooks/use-site-global-styles-status';
import Panel from './panel';
import type { GlobalStylesObject } from '@automattic/global-styles';

interface Props {
	siteId: number | string;
	stylesheet: string;
	selectedFontPairingVariation: GlobalStylesObject | null;
	onSelect: ( fontPairingVariation: GlobalStylesObject | null ) => void;
}

const ScreenFontPairings = ( {
	siteId,
	stylesheet,
	selectedFontPairingVariation,
	onSelect,
}: Props ) => {
	const translate = useTranslate();
	const { shouldLimitGlobalStyles } = useSiteGlobalStylesStatus( siteId );

	return (
		<Panel
			label={ translate( 'Fonts' ) }
			description={ translate( 'Elevate your design with expertly curated font pairings.' ) }
		>
			<FontPairingVariations
				siteId={ siteId }
				stylesheet={ stylesheet }
				selectedFontPairingVariation={ selectedFontPairingVariation }
				onSelect={ onSelect }
				limitGlobalStyles={ shouldLimitGlobalStyles }
			/>
		</Panel>
	);
};

export default ScreenFontPairings;
