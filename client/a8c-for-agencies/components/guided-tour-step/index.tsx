import { Button, Popover } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { LegacyRef, useContext, useEffect } from 'react';
import { GuidedTourContext } from 'calypso/a8c-for-agencies/data/guided-tours/guided-tour-context';

type Props = {
	id: string;
	context: LegacyRef< HTMLSpanElement | null >;
	className?: string;
	hideSteps?: boolean;
};

/**
 * Renders a single step in a guided tour.
 */
export function GuidedTourStep( { id, context, hideSteps, className }: Props ) {
	const translate = useTranslate();

	const {
		currentStep,
		currentStepCount,
		stepsCount,
		nextStep,
		endTour,
		registerRenderedStep,
		unregisterRenderedStep,
		tourDismissed,
	} = useContext( GuidedTourContext );

	const lastTourLabel = stepsCount === 1 ? translate( 'Got it' ) : translate( 'Done' );

	// Keep track of which tour steps are currently rendered/mounted.
	useEffect( () => {
		// Register on mount.
		registerRenderedStep( id );
		// Unregister on unmount.
		return () => unregisterRenderedStep( id );
	}, [ id, registerRenderedStep, unregisterRenderedStep ] );

	// Do not render unless this is the current step in the active tour.
	if ( ! currentStep || id !== currentStep.id || tourDismissed ) {
		return null;
	}

	return (
		<Popover
			isVisible={ true }
			className={ classNames( className, 'guided-tour__popover' ) }
			context={ context }
			position={ currentStep.popoverPosition }
		>
			<h2 className="guided-tour__popover-heading">{ currentStep.title }</h2>
			<p className="guided-tour__popover-description">{ currentStep.description }</p>
			<div className="guided-tour__popover-footer">
				<div>
					{
						// Show the step count if there are multiple steps and we're not on the last step, unless we explicitly choose to hide them
						stepsCount > 1 && ! hideSteps && (
							<span className="guided-tour__popover-step-count">
								{ translate( 'Step %(currentStep)d of %(totalSteps)d', {
									args: { currentStep: currentStepCount, totalSteps: stepsCount },
								} ) }
							</span>
						)
					}
				</div>
				<div className="guided-tour__popover-footer-right-content">
					<>
						{ ( ( ! currentStep.nextStepOnTargetClick &&
							stepsCount > 1 &&
							currentStepCount < stepsCount ) ||
							currentStep.forceShowSkipButton ) && (
							// Show the skip button if there are multiple steps and we're not on the last step, unless we explicitly choose to add them
							<Button borderless onClick={ endTour }>
								{ translate( 'Skip' ) }
							</Button>
						) }
						{ ! currentStep.nextStepOnTargetClick && (
							<Button onClick={ nextStep }>
								{ currentStepCount === stepsCount ? lastTourLabel : translate( 'Next' ) }
							</Button>
						) }
					</>
				</div>
			</div>
		</Popover>
	);
}
