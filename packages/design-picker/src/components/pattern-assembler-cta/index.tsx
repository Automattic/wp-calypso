import { Button } from '@automattic/components';
import { useViewportMatch } from '@wordpress/compose';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import blankCanvasImage from '../assets/images/blank-canvas-cta.svg';
import './style.scss';

type PatternAssemblerCtaProps = {
	compact?: boolean;
	hasPrimaryButton?: boolean;
	onButtonClick: ( shouldGoToAssemblerStep: boolean ) => void;
	showEditorFallback?: boolean;
};

const PatternAssemblerCta = ( {
	compact = false,
	hasPrimaryButton = true,
	onButtonClick,
	showEditorFallback = true,
}: PatternAssemblerCtaProps ) => {
	const translate = useTranslate();
	const isDesktop = useViewportMatch( 'large' );

	const shouldGoToAssemblerStep = isDesktop;

	const handleButtonClick = () => {
		onButtonClick( shouldGoToAssemblerStep );
	};

	if ( ! shouldGoToAssemblerStep && ! showEditorFallback ) {
		return null;
	}

	return (
		<div className={ classnames( 'pattern-assembler-cta-wrapper', { 'is-compact': compact } ) }>
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
			<Button
				className="pattern-assembler-cta__button"
				onClick={ handleButtonClick }
				primary={ hasPrimaryButton }
			>
				{ shouldGoToAssemblerStep
					? translate( 'Start designing' )
					: translate( 'Open the editor' ) }
			</Button>
		</div>
	);
};

export default PatternAssemblerCta;
