import { Button } from '@automattic/components';
import { useViewportMatch } from '@wordpress/compose';
import { useTranslate } from 'i18n-calypso';
import { ReactNode } from 'react';
import assemblerIllustrationV2Image from '../assets/images/assembler-illustration-v2.png';
import './style.scss';

type PatternAssemblerCtaData = {
	shouldGoToAssemblerStep: boolean;
	title: string;
	subtitle: string | ReactNode;
	buttonText: string;
};

type PatternAssemblerCtaProps = {
	onButtonClick: () => void;
};

export function usePatternAssemblerCtaData(): PatternAssemblerCtaData {
	const translate = useTranslate();
	const isDesktop = useViewportMatch( 'large' );

	const shouldGoToAssemblerStep = isDesktop;

	return {
		shouldGoToAssemblerStep,
		title: translate( 'Design your own' ),
		subtitle: shouldGoToAssemblerStep ? (
			<ul>
				<li>{ translate( 'Select patterns to create your homepage layout.' ) }</li>
				<li>{ translate( 'Style it up with premium colors and font pairings.' ) }</li>
				<li>{ translate( 'Add powerful pages to fill out your site.' ) }</li>
				<li>{ translate( 'Bring your site to life with your own content.' ) }</li>
			</ul>
		) : (
			translate( 'Jump right into the editor to design your homepage from scratch.' )
		),
		buttonText: shouldGoToAssemblerStep
			? translate( 'Get started' )
			: translate( 'Open the editor' ),
	};
}

const PatternAssemblerCta = ( { onButtonClick }: PatternAssemblerCtaProps ) => {
	const data = usePatternAssemblerCtaData();

	return (
		<div className="pattern-assembler-cta-wrapper">
			<div className="pattern-assembler-cta__image-wrapper">
				<img
					className="pattern-assembler-cta__image"
					src={ assemblerIllustrationV2Image }
					alt="Pattern Assembler"
				/>
			</div>
			<div className="pattern-assembler-cta__content">
				<h3 className="pattern-assembler-cta__title">{ data.title }</h3>
				<div className="pattern-assembler-cta__subtitle">{ data.subtitle }</div>
				<Button className="pattern-assembler-cta__button" onClick={ onButtonClick } primary>
					{ data.buttonText }
				</Button>
			</div>
		</div>
	);
};

export default PatternAssemblerCta;
