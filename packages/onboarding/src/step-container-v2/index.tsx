/* eslint-disable no-nested-ternary */
import { WordPressLogo, WordPressWordmark } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { chevronLeft } from '@wordpress/icons';
import clsx from 'clsx';
import { ComponentProps, ReactNode } from 'react';
import { Heading } from './Heading';

import './style.scss';

type ButtonProps = ( () => void ) | ComponentProps< typeof Button >;

interface StepContainerV2Props {
	heading: ComponentProps< typeof Heading > & {
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

const SecondaryButton = ( { label, ...props }: ComponentProps< typeof Button > ) => {
	return (
		<Button __next40pxDefaultSize variant="link" { ...props }>
			{ label }
		</Button>
	);
};

interface RenderStepProps {
	heading?: ReactNode;
	nextButton?: ReactNode;
}

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
		};
	}

	return {
		...standardProps,
		...button,
		className: clsx( standardProps.className, button.className ),
	};
};

export const StepContainerV2 = ( {
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
	const _isSmallScreen = useViewportMatch( 'small', '<' );
	const isSmallScreen = externallyProvidedIsSmallScreen ?? _isSmallScreen;

	const headingElement = heading ? <Heading { ...heading } /> : null;

	const backButtonProps = normalizeButtonProps( backButton, {
		label: 'Back',
		className: 'step-container-v2__back-button',
		icon: chevronLeft,
	} );

	const skipButtonProps = normalizeButtonProps( skipButton, {
		label: 'Skip',
		className: 'step-container-v2__skip-button',
	} );

	const nextButtonProps = normalizeButtonProps( nextButton, {
		label: 'Next',
		className: 'step-container-v2__next-button',
	} );

	const backButtonElement = backButtonProps && <SecondaryButton { ...backButtonProps } />;
	const skipButtonElement = skipButtonProps && <SecondaryButton { ...skipButtonProps } />;
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
						size={ { width: 133, height: 18 } }
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
				{ heading && ! heading.customPlacement && headingElement }
				<div
					className={ clsx( 'step-container-v2__content', {
						wide: width === 'wide',
						full: width === 'full',
					} ) }
				>
					{ render( {
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
