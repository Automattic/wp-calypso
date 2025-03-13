/* eslint-disable no-nested-ternary */
import { WordPressLogo, WordPressWordmark } from '@automattic/components';
import { Onboard, OnboardSelect } from '@automattic/data-stores';
import { Button } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { select } from '@wordpress/data';
import { chevronLeft } from '@wordpress/icons';
import clsx from 'clsx';
import { ComponentProps, ReactNode } from 'react';
import { Heading } from './Heading';
import {
	StepContainerV2ContextType,
	useStepContainerV2Context,
	StepContainerV2Provider,
} from './StepContainerV2Context';

import './style.scss';

type ButtonProps = ( () => void ) | ComponentProps< typeof Button >;

interface StepContainerV2Props {
	className?: string;
	heading?: ComponentProps< typeof Heading > & {
		customPlacement?: boolean;
	};
	bottomBar?: {
		backButton?: boolean;
	};
	width?: 'standard' | 'wide' | 'full';
	verticalAlign?: 'top' | 'center';
	backButton?: ButtonProps;
	skipButton?: ButtonProps;
	nextButton?: ButtonProps;
	isSmallScreen?: boolean;
	render: ( props: RenderStepProps ) => React.ReactNode;
}

const PrimaryButton = ( { label, ...props }: ComponentProps< typeof Button > ) => {
	return (
		<Button __next40pxDefaultSize variant="primary" { ...props }>
			{ label }
		</Button>
	);
};

interface RenderStepProps {
	heading?: ReactNode;
	nextButton?: ReactNode;
	isSmallScreen: boolean;
}

const decorateButtonWithTracks = (
	{ onClick, ...props }: ComponentProps< typeof Button >,
	{
		tracksEventName,
		stepContext,
	}: { tracksEventName: string; stepContext: StepContainerV2ContextType }
): ComponentProps< typeof Button > => {
	const onClickHandler = (
		event: React.MouseEvent< HTMLAnchorElement, MouseEvent > &
			React.MouseEvent< HTMLButtonElement, MouseEvent >
	) => {
		onClick?.( event );

		stepContext.recordTracksEvent?.( tracksEventName, {
			flow: stepContext.flowName,
			step: stepContext.stepName,
			intent: ( select( Onboard.register() ) as OnboardSelect ).getIntent(),
		} );
	};

	return { ...props, onClick: onClickHandler };
};

const normalizeButtonProps = < T extends ComponentProps< typeof Button > >(
	button: ButtonProps | undefined,
	standardProps: T
): T | null => {
	if ( ! button ) {
		return null;
	}

	if ( typeof button === 'function' ) {
		return {
			...standardProps,
			onClick: button,
			children: standardProps.label,
		};
	}

	return {
		...standardProps,
		...button,
		children: button.label,
		className: clsx( standardProps.className, button.className ),
	};
};

export const StepContainerV2 = ( {
	className,
	heading,
	bottomBar = { backButton: false },
	width = 'standard',
	verticalAlign = 'top',
	backButton,
	skipButton,
	nextButton,
	isSmallScreen: externallyProvidedIsSmallScreen,
	render,
}: StepContainerV2Props ) => {
	const stepContext = useStepContainerV2Context();

	const _isSmallScreen = useViewportMatch( 'small', '<' );
	const isSmallScreen = externallyProvidedIsSmallScreen ?? _isSmallScreen;

	const headingElement = heading ? <Heading { ...heading } /> : null;

	const backButtonProps = normalizeButtonProps( backButton, {
		label: 'Back',
		className: 'step-container-v2__back-button',
		icon: chevronLeft,
	} );

	const backButtonElement = backButtonProps && (
		<Button
			{ ...decorateButtonWithTracks( backButtonProps, {
				tracksEventName: 'calypso_signup_previous_step_button_click',
				stepContext,
			} ) }
		/>
	);

	const skipButtonProps = normalizeButtonProps( skipButton, {
		label: 'Skip',
		className: 'step-container-v2__skip-button',
	} );

	const skipButtonElement = skipButtonProps && (
		<Button
			variant="link"
			{ ...decorateButtonWithTracks( skipButtonProps, {
				tracksEventName: 'calypso_signup_skip_step',
				stepContext,
			} ) }
		/>
	);

	const nextButtonProps = normalizeButtonProps( nextButton, {
		label: 'Next',
		className: 'step-container-v2__next-button',
	} );

	const nextButtonElement = nextButtonProps && <PrimaryButton { ...nextButtonProps } />;

	const backButtonAtTheBottom = backButton && bottomBar.backButton;
	const shouldDisplayBottomBar = isSmallScreen && ( backButtonAtTheBottom || nextButton );

	return (
		<div className={ clsx( 'step-container-v2', { 'large-viewport': ! isSmallScreen } ) }>
			<div className="step-container-v2__top-bar">
				{ isSmallScreen ? (
					<WordPressLogo size={ 21 } className="step-container-v2__wordpress-logo" />
				) : (
					<WordPressWordmark
						size={ { width: 134, height: 18 } }
						className="step-container-v2__wordpress-logo"
						color="currentColor"
					/>
				) }

				{ backButtonElement && (
					<>
						<div className="step-container-v2__top-bar-divider" />
						<div className="step-container-v2__top-bar-left-button">{ backButtonElement }</div>
					</>
				) }
				{ skipButtonElement && (
					<div className="step-container-v2__top-bar-right-button">{ skipButtonElement }</div>
				) }
			</div>
			<div
				className={ clsx( 'step-container-v2__content-wrapper', {
					'vertical-align-center': verticalAlign === 'center',
				} ) }
			>
				{ ! heading?.customPlacement && headingElement }
				<div
					className={ clsx( 'step-container-v2__content', className, {
						'large-viewport': ! isSmallScreen,
						wide: width === 'wide',
						full: width === 'full',
					} ) }
				>
					{ render( {
						isSmallScreen,
						heading: headingElement,
						nextButton: ! isSmallScreen && nextButtonElement,
					} ) }
				</div>
			</div>
			{ shouldDisplayBottomBar && (
				<div className="step-container-v2__bottom-bar">
					{ backButtonAtTheBottom && (
						<div className="step-container-v2__bottom-bar-left-button">{ backButtonElement }</div>
					) }
					{ nextButtonElement && (
						<div className="step-container-v2__bottom-bar-right-button">{ nextButtonElement }</div>
					) }
				</div>
			) }
		</div>
	);
};

export { StepContainerV2Provider };
