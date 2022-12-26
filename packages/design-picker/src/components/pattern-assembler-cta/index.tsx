import { Button } from '@automattic/components';
import { useViewportMatch } from '@wordpress/compose';
import { useTranslate } from 'i18n-calypso';
import blankCanvasImage from '../assets/images/blank-canvas-cta.svg';
import './style.scss';

type PatternAssemblerCtaProps = {
	onButtonClick: ( shouldGoToAssemblerStep: boolean ) => void;
};

const PatternAssemblerCta = ( { onButtonClick }: PatternAssemblerCtaProps ) => {
	const translate = useTranslate();
	const isDesktop = useViewportMatch( 'large' );

	const shouldGoToAssemblerStep = isDesktop;

	const handleButtonClick = () => {
		onButtonClick( shouldGoToAssemblerStep );
	};

	return (
		<div className="pattern-assembler-cta-wrapper">
			<div className="pattern-assembler-cta__image-wrapper">
				<img className="pattern-assembler-cta__image" src={ blankCanvasImage } alt="Blank Canvas" />
			</div>
			<h3 className="pattern-assembler-cta__title">{ translate( 'Design your own' ) }</h3>
			<p className="pattern-assembler-cta__subtitle">
				{ shouldGoToAssemblerStep
					? translate(
							"Can't find something you like? Start with a blank canvas and design your own homepage using our library of patterns."
					  )
					: translate(
							"Can't find something you like? Jump right into the editor to design your homepage from scratch."
					  ) }
			</p>
			<Button className="pattern-assembler-cta__button" onClick={ handleButtonClick } primary>
				{ shouldGoToAssemblerStep
					? translate( 'Start designing' )
					: translate( 'Open the editor' ) }
			</Button>
		</div>
	);
};

export default PatternAssemblerCta;
