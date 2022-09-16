import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import blankCanvasImage from '../assets/images/blank-canvas-cta.svg';
import './style.scss';

type PatternAssemblerCtaProps = {
	onButtonClick: () => void;
};

const PatternAssemblerCta = ( { onButtonClick }: PatternAssemblerCtaProps ) => {
	const translate = useTranslate();

	return (
		<div className="pattern-assembler-cta-wrapper">
			<div className="pattern-assembler-cta__image-wrapper">
				<img className="pattern-assembler-cta__image" src={ blankCanvasImage } alt="Blank Canvas" />
			</div>
			<h3 className="pattern-assembler-cta__title">{ translate( 'Start with a blank canvas' ) }</h3>
			<p className="pattern-assembler-cta__subtitle">
				{ translate(
					"Can't find something you like? Create something of your own by mixing and matching patterns."
				) }
			</p>
			<Button className="pattern-assembler-cta__button" onClick={ onButtonClick } primary>
				{ translate( 'Get Started' ) }
			</Button>
		</div>
	);
};

export default PatternAssemblerCta;
