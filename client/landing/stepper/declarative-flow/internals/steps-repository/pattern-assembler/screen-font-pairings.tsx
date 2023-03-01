import { Button } from '@automattic/components';
import { FontPairingVariations } from '@automattic/global-styles';
import { __experimentalNavigatorBackButton as NavigatorBackButton } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import NavigatorHeader from './navigator-header';
import type { GlobalStylesObject } from '@automattic/global-styles';

interface Props {
	siteId: number | string;
	stylesheet: string;
	selectedFontPairingVariation: GlobalStylesObject | null;
	onSelect: ( fontPairingVariation: GlobalStylesObject | null ) => void;
	onDoneClick: () => void;
}

const ScreenFontPairings = ( {
	siteId,
	stylesheet,
	selectedFontPairingVariation,
	onSelect,
	onDoneClick,
}: Props ) => {
	const translate = useTranslate();

	return (
		<>
			<NavigatorHeader
				title={ translate( 'Fonts' ) }
				description={ translate(
					'We’ve hand picked a selection of font pairings that you can customise later.'
				) }
			/>
			<div className="screen-container__body">
				<FontPairingVariations
					siteId={ siteId }
					stylesheet={ stylesheet }
					selectedFontPairingVariation={ selectedFontPairingVariation }
					onSelect={ onSelect }
				/>
			</div>
			<div className="screen-container__footer">
				<NavigatorBackButton
					as={ Button }
					className="pattern-assembler__button"
					onClick={ onDoneClick }
					primary
				>
					{ translate( 'Done' ) }
				</NavigatorBackButton>
			</div>
		</>
	);
};

export default ScreenFontPairings;
