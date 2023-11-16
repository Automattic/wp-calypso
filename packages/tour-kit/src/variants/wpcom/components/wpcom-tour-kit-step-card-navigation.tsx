import { PaginationControl } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
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
	const { __ } = useI18n();
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
						<Button variant="tertiary" onClick={ onDismiss( 'no-thanks-btn' ) }>
							{ __( 'Skip', __i18n_text_domain__ ) }
						</Button>
						<Button
							className="wpcom-tour-kit-step-card-navigation__next-btn"
							variant="primary"
							onClick={ onNextStep }
							ref={ setInitialFocusedElement }
						>
							{ __( 'Take the tour', __i18n_text_domain__ ) }
						</Button>
					</div>
				) : (
					<div>
						<Button variant="tertiary" onClick={ onPreviousStep }>
							{ __( 'Back', __i18n_text_domain__ ) }
						</Button>
						<Button
							className="wpcom-tour-kit-step-card-navigation__next-btn"
							variant="primary"
							onClick={ onNextStep }
							ref={ setInitialFocusedElement }
						>
							{ __( 'Next', __i18n_text_domain__ ) }
						</Button>
					</div>
				) }
			</PaginationControl>
		</>
	);
};

export default WpcomTourKitStepCardNavigation;
