import { Button } from '@automattic/components';
import { ColorPaletteVariations } from '@automattic/global-styles';
import { NavigatorHeader } from '@automattic/onboarding';
import { __experimentalNavigatorBackButton as NavigatorBackButton } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useSiteGlobalStylesStatus } from 'calypso/state/sites/hooks/use-site-global-styles-status';
import NavigatorTitle from './navigator-title';
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
	const { shouldLimitGlobalStyles } = useSiteGlobalStylesStatus( siteId );

	return (
		<>
			<NavigatorHeader
				title={ <NavigatorTitle title={ translate( 'Colors' ) } /> }
				description={ translate(
					'Find your perfect color style. Change the look and feel of your site in one click with our custom colors.'
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
