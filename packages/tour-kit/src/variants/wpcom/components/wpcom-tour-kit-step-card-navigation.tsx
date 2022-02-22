import { PaginationControl } from '@automattic/components';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { WpcomTourStepRendererProps } from '../../../types';

type Props = Omit< WpcomTourStepRendererProps, 'onMinimize' >;

const WpcomTourKitStepCardNavigation: React.FunctionComponent< Props > = ( {
	currentStepIndex,
	onDismiss,
	onGoToStep,
	onNextStep,
	onPreviousStep,
	setInitialFocusedElement,
	steps,
} ) => {
	const isFirstStep = currentStepIndex === 0;
	const lastStepIndex = steps.length - 1;

	return (
		<>
			<PaginationControl
				activePageIndex={ currentStepIndex }
				numberOfPages={ lastStepIndex + 1 }
				onChange={ onGoToStep }
			>
				{ isFirstStep ? (
					<div>
						<Button isTertiary onClick={ onDismiss( 'no-thanks-btn' ) }>
							{ __( 'Skip', 'full-site-editing' ) }
						</Button>
						<Button
							className="wpcom-tour-kit-step-card-navigation__next-btn"
							isPrimary
							onClick={ onNextStep }
							ref={ setInitialFocusedElement }
						>
							{ __( 'Try it out!', 'full-site-editing' ) }
						</Button>
					</div>
				) : (
					<div>
						<Button isTertiary onClick={ onPreviousStep }>
							{ __( 'Back', 'full-site-editing' ) }
						</Button>
						<Button
							className="wpcom-tour-kit-step-card-navigation__next-btn"
							isPrimary
							onClick={ onNextStep }
							ref={ setInitialFocusedElement }
						>
							{ __( 'Next', 'full-site-editing' ) }
						</Button>
					</div>
				) }
			</PaginationControl>
		</>
	);
};

export default WpcomTourKitStepCardNavigation;
