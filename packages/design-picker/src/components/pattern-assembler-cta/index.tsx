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
	showHeading?: boolean;
	text?: string | JSX.Element;
};

const PatternAssemblerCta = ( {
	compact = false,
	hasPrimaryButton = true,
	onButtonClick,
	showEditorFallback = true,
	showHeading = true,
	text: customText,
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

	let text = customText;
	if ( ! text ) {
		text = (
			<>
				{ translate( 'Can’t find something you like?' ) }
				<br />
				{ shouldGoToAssemblerStep
					? translate( 'Use our library of styles and patterns to build a homepage.' )
					: translate( 'Jump right into the editor to design your homepage from scratch.' ) }
			</>
		);
	}

	return (
		<div className={ classnames( 'pattern-assembler-cta-wrapper', { 'is-compact': compact } ) }>
			<div className="pattern-assembler-cta__image-wrapper">
				<img className="pattern-assembler-cta__image" src={ blankCanvasImage } alt="Blank Canvas" />
			</div>
			{ showHeading && (
				<h3 className="pattern-assembler-cta__title">{ translate( 'Design your own' ) }</h3>
			) }
			<p className="pattern-assembler-cta__subtitle">{ text }</p>
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
