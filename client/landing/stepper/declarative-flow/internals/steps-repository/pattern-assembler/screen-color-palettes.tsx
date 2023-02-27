import { Button } from '@automattic/components';
import { ColorPaletteVariations } from '@automattic/global-styles';
import { __experimentalNavigatorBackButton as NavigatorBackButton } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import NavigatorHeader from './navigator-header';

interface Props {
	siteId: number | string;
	stylesheet: string;
	onDoneClick: () => void;
}

const ScreenColorPalettes = ( { siteId, stylesheet, onDoneClick }: Props ) => {
	const translate = useTranslate();

	return (
		<>
			<NavigatorHeader
				title={ translate( 'Colours' ) }
				description={ translate( 'Foreground and background colours used throughout your site.' ) }
			/>
			<div className="screen-container__body">
				<ColorPaletteVariations siteId={ siteId } stylesheet={ stylesheet } />
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

export default ScreenColorPalettes;
