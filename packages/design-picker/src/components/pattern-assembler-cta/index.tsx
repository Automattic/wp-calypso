import { Button } from '@automattic/components';
import { useViewportMatch } from '@wordpress/compose';
import { useTranslate } from 'i18n-calypso';
import blankCanvasImage from '../assets/images/blank-canvas-cta.svg';
import './style.scss';

type PatternAssemblerCtaData = {
	shouldGoToAssemblerStep: boolean;
	title: string;
	subtitleLineOne: string;
	subtitleLineTwo: string;
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
		subtitleLineOne: translate( 'Can’t find something you like?' ),
		subtitleLineTwo: shouldGoToAssemblerStep
			? translate( 'Use our library of styles and patterns to build a homepage.' )
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
			<p className="pattern-assembler-cta__subtitle">
				{ data.subtitleLineOne }
				<br />
				{ data.subtitleLineTwo }
			</p>
			<Button className="pattern-assembler-cta__button" onClick={ handleButtonClick } primary>
				{ data.buttonText }
			</Button>
		</div>
	);
};

export default PatternAssemblerCta;
