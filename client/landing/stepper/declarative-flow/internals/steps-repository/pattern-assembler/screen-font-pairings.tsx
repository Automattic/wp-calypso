import { Button } from '@automattic/components';
import { FontPairingVariations } from '@automattic/global-styles';
import { NavigatorHeader } from '@automattic/onboarding';
import { __experimentalNavigatorBackButton as NavigatorBackButton } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useSiteGlobalStylesStatus } from 'calypso/state/sites/hooks/use-site-global-styles-status';
import NavigatorTitle from './navigator-title';
import type { GlobalStylesObject } from '@automattic/global-styles';

interface Props {
	siteId: number | string;
	stylesheet: string;
	selectedFontPairingVariation: GlobalStylesObject | null;
	onSelect: ( fontPairingVariation: GlobalStylesObject | null ) => void;
	onBack: () => void;
	onDoneClick: () => void;
}

const ScreenFontPairings = ( {
	siteId,
	stylesheet,
	selectedFontPairingVariation,
	onSelect,
	onBack,
	onDoneClick,
}: Props ) => {
	const translate = useTranslate();
	const { shouldLimitGlobalStyles } = useSiteGlobalStylesStatus( siteId );

	return (
		<>
			<NavigatorHeader
				title={ <NavigatorTitle title={ translate( 'Fonts' ) } /> }
				description={ translate( 'Elevate your design with expertly curated font pairings.' ) }
				onBack={ onBack }
			/>
			<div className="screen-container__body">
				<FontPairingVariations
					siteId={ siteId }
					stylesheet={ stylesheet }
					selectedFontPairingVariation={ selectedFontPairingVariation }
					onSelect={ onSelect }
					limitGlobalStyles={ shouldLimitGlobalStyles }
				/>
			</div>
			<div className="screen-container__footer">
				<NavigatorBackButton
					as={ Button }
					className="pattern-assembler__button"
					onClick={ onDoneClick }
					primary
				>
					{ translate( 'Save fonts' ) }
				</NavigatorBackButton>
			</div>
		</>
	);
};

export default ScreenFontPairings;
