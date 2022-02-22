import { getMediaQueryList, isMobile, MOBILE_BREAKPOINT } from '@automattic/viewport';
import { Button, Card, CardBody, CardFooter, CardMedia } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import WpcomTourKitRating from './wpcom-tour-kit-rating';
import WpcomTourKitStepCardNavigation from './wpcom-tour-kit-step-card-navigation';
import WpcomTourKitStepCardOverlayControls from './wpcom-tour-kit-step-card-overlay-controls';
import type { WpcomTourStepRendererProps } from '../../../types';

const WpcomTourKitStepCard: React.FunctionComponent< WpcomTourStepRendererProps > = ( {
	steps,
	currentStepIndex,
	onMinimize,
	onDismiss,
	onGoToStep,
	onNextStep,
	onPreviousStep,
	setInitialFocusedElement,
} ) => {
	const lastStepIndex = steps.length - 1;
	const { descriptions, heading, imgSrc } = steps[ currentStepIndex ].meta;
	const isLastStep = currentStepIndex === lastStepIndex;

	const description = descriptions[ isMobile() ? 'mobile' : 'desktop' ] ?? descriptions.desktop;

	// @todo check why the assertion is needed here to pass TS
	const mediaQueryList = getMediaQueryList( MOBILE_BREAKPOINT ) as MediaQueryList | undefined;

	return (
		<Card className="wpcom-tour-kit-step-card" isElevated>
			<WpcomTourKitStepCardOverlayControls onDismiss={ onDismiss } onMinimize={ onMinimize } />
			{ imgSrc && (
				<CardMedia className="wpcom-tour-kit-step-card__media">
					<picture>
						{ imgSrc.mobile && (
							<source
								srcSet={ imgSrc.mobile.src }
								type={ imgSrc.mobile.type }
								media={ mediaQueryList?.media }
							/>
						) }
						<img
							alt={ __( 'Editor Welcome Tour', 'full-site-editing' ) }
							src={ imgSrc.desktop?.src }
						/>
					</picture>
				</CardMedia>
			) }
			<CardBody>
				<h2 className="wpcom-tour-kit-step-card__heading">{ heading }</h2>
				<p className="wpcom-tour-kit-step-card__description">
					{ description }
					{ isLastStep ? (
						<Button
							className="wpcom-tour-kit-step-card__description"
							isTertiary
							onClick={ () => onGoToStep( 0 ) }
							ref={ setInitialFocusedElement }
						>
							{ __( 'Restart tour', 'full-site-editing' ) }
						</Button>
					) : null }
				</p>
			</CardBody>
			<CardFooter>
				{ isLastStep ? (
					<WpcomTourKitRating />
				) : (
					<WpcomTourKitStepCardNavigation
						currentStepIndex={ currentStepIndex }
						onDismiss={ onDismiss }
						onGoToStep={ onGoToStep }
						onNextStep={ onNextStep }
						onPreviousStep={ onPreviousStep }
						setInitialFocusedElement={ setInitialFocusedElement }
						steps={ steps }
					></WpcomTourKitStepCardNavigation>
				) }
			</CardFooter>
		</Card>
	);
};

export default WpcomTourKitStepCard;
