import { Button } from '@automattic/components';
import { useViewportMatch } from '@wordpress/compose';
import { useTranslate } from 'i18n-calypso';
import blankCanvasImage from '../assets/images/blank-canvas-cta.svg';
import './style.scss';

type PatternAssemblerCtaData = {
	shouldGoToAssemblerStep: boolean;
	title: string;
	subtitle: string;
	buttonText: string;
};

type PatternAssemblerCtaProps = {
	onButtonClick: ( shouldGoToAssemblerStep: boolean ) => void;
};

export function usePatternAssemblerCtaData(): PatternAssemblerCtaData {
	const translate = useTranslate();
	const isDesktop = useViewportMatch( 'large' );

	const shouldGoToAssemblerStep = isDesktop;

	return {
		shouldGoToAssemblerStep,
		title: translate( 'Design your own' ),
		subtitle: shouldGoToAssemblerStep
			? translate(
					'Unleash your creativity in just three simple steps: add patterns, choose colors, and select fonts to design your perfect site.'
			  )
			: translate( 'Jump right into the editor to design your homepage from scratch.' ),
		buttonText: shouldGoToAssemblerStep
			? translate( 'Start designing' )
			: translate( 'Open the editor' ),
	};
}

const PatternAssemblerCta = ( { onButtonClick }: PatternAssemblerCtaProps ) => {
	const data = usePatternAssemblerCtaData();

	const handleButtonClick = () => {
		onButtonClick( data.shouldGoToAssemblerStep );
	};

	return (
		<div className="pattern-assembler-cta-wrapper">
			<div className="pattern-assembler-cta__image-wrapper">
				<img className="pattern-assembler-cta__image" src={ blankCanvasImage } alt="Blank Canvas" />
			</div>
			<h3 className="pattern-assembler-cta__title">{ data.title }</h3>
			<p className="pattern-assembler-cta__subtitle">{ data.subtitle }</p>
			<Button className="pattern-assembler-cta__button" onClick={ handleButtonClick } primary>
				{ data.buttonText }
			</Button>
		</div>
	);
};

export default PatternAssemblerCta;
