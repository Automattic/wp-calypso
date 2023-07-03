import { Button } from '@automattic/components';
import { ColorPaletteVariations } from '@automattic/global-styles';
import { __experimentalNavigatorBackButton as NavigatorBackButton } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { usePremiumGlobalStyles } from 'calypso/state/sites/hooks/use-premium-global-styles';
import NavigatorHeader from './navigator-header';
import type { GlobalStylesObject } from '@automattic/global-styles';

interface Props {
	siteId: number | string;
	stylesheet: string;
	selectedColorPaletteVariation: GlobalStylesObject | null;
	onSelect: ( colorPaletteVariation: GlobalStylesObject | null ) => void;
	onBack: () => void;
	onDoneClick: () => void;
}

const ScreenColorPalettes = ( {
	siteId,
	stylesheet,
	selectedColorPaletteVariation,
	onSelect,
	onBack,
	onDoneClick,
}: Props ) => {
	const translate = useTranslate();
	const { shouldLimitGlobalStyles } = usePremiumGlobalStyles( siteId );

	return (
		<>
			<NavigatorHeader
				title={ translate( 'Colors' ) }
				description={ translate(
					'Choose from our curated color palettes when you upgrade to the Premium plan or above.'
				) }
				onBack={ onBack }
			/>
			<div className="screen-container__body">
				<ColorPaletteVariations
					siteId={ siteId }
					stylesheet={ stylesheet }
					selectedColorPaletteVariation={ selectedColorPaletteVariation }
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
					{ translate( 'Save colors' ) }
				</NavigatorBackButton>
			</div>
		</>
	);
};

export default ScreenColorPalettes;
