import { Button } from '@automattic/components';
import { useViewportMatch } from '@wordpress/compose';
import { useTranslate } from 'i18n-calypso';
import blankCanvasImage from '../assets/images/blank-canvas-cta.svg';
import './style.scss';

type PatternAssemblerCtaProps = {
	onButtonClick: () => void;
};

const PatternAssemblerCta = ( { onButtonClick }: PatternAssemblerCtaProps ) => {
	const translate = useTranslate();
	const isDesktop = useViewportMatch( 'large' );

	return (
		<div className="pattern-assembler-cta-wrapper">
			<div className="pattern-assembler-cta__image-wrapper">
				<img className="pattern-assembler-cta__image" src={ blankCanvasImage } alt="Blank Canvas" />
			</div>
			<h3 className="pattern-assembler-cta__title">{ translate( 'Start with a blank canvas' ) }</h3>
			<p className="pattern-assembler-cta__subtitle">
				{ ! isDesktop
					? translate(
							"Can't find something you like? Jump right into the editor to design your homepage from scratch."
					  )
					: translate(
							"Can't find something you like? Create something of your own by mixing and matching patterns."
					  ) }
			</p>
			<Button className="pattern-assembler-cta__button" onClick={ onButtonClick } primary>
				{ ! isDesktop ? translate( 'Open the editor' ) : translate( 'Get started' ) }
			</Button>
		</div>
	);
};

export default PatternAssemblerCta;
