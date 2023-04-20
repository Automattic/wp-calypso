import { Button } from '@automattic/components';
import { FontPairingVariations } from '@automattic/global-styles';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { __experimentalNavigatorBackButton as NavigatorBackButton } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import NavigatorHeader from './navigator-header';
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
	const hasEnTranslation = useHasEnTranslation();

	return (
		<>
			<NavigatorHeader
				title={ translate( 'Fonts' ) }
				description={
					hasEnTranslation(
						'Choose from our curated font pairings when you upgrade to the Premium plan or above.'
					)
						? translate(
								'Choose from our curated font pairings when you upgrade to the Premium plan or above.'
						  )
						: translate(
								'Select from our hand-picked font pairings or expanded library when you upgrade to the Premium plan or higher.'
						  )
				}
				isPremium
				onBack={ onBack }
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
					{ translate( 'Save' ) }
				</NavigatorBackButton>
			</div>
		</>
	);
};

export default ScreenFontPairings;
