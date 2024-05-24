import { Button, Popover } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useContext, useEffect, useMemo } from 'react';
import { GuidedTourContext } from 'calypso/a8c-for-agencies/data/guided-tours/guided-tour-context';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import {
	getPreference,
	preferencesLastFetchedTimestamp,
} from 'calypso/state/preferences/selectors';

import './style.scss';

type Props = {
	id: string;
	tourId: string;
	context?: HTMLElement | null;
	className?: string;
	hideSteps?: boolean;
	title?: JSX.Element;
	description?: JSX.Element;
};

/**
 * Renders a single step in a guided tour.
 */
export function GuidedTourStep( {
	id,
	tourId,
	context,
	hideSteps,
	className,
	title,
	description,
}: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { currentStep, currentStepCount, stepsCount, nextStep, preferenceNames, eventNames } =
		useContext( GuidedTourContext );

	const preference = useSelector( ( state ) => getPreference( state, preferenceNames[ tourId ] ) );
	const hasFetched = !! useSelector( preferencesLastFetchedTimestamp );
	const showTour = useMemo( () => {
		return Boolean( hasFetched && ! preference?.dismiss && currentStep && currentStep.id === id );
	}, [ currentStep, hasFetched, id, preference?.dismiss ] );

	const lastTourLabel = stepsCount === 1 ? translate( 'Got it' ) : translate( 'Done' );

	/**
	 * Dismiss all steps in the tour.
	 */
	const endTour = useCallback( () => {
		dispatch(
			savePreference( preferenceNames[ tourId ], {
				...preference,
				dismiss: true,
			} )
		);
		dispatch(
			recordTracksEvent( eventNames.endTour, {
				tour: id,
			} )
		);
	}, [ dispatch, tourId, preference, id ] );

	// Record an event when the tour starts
	useEffect( () => {
		if ( currentStepCount === 1 && showTour ) {
			dispatch(
				recordTracksEvent( eventNames.startTour, {
					tour: id,
				} )
			);
		}
	}, [ currentStepCount, showTour, id, dispatch ] );

	// Add a click event listener to the context element if the step requires it
	useEffect( () => {
		if ( currentStep && currentStep.nextStepOnTargetClick && context ) {
			( context as HTMLElement ).addEventListener( 'click', nextStep );
		}

		// Cleanup function to remove the event listener on unmount
		return () => {
			if ( context ) {
				( context as HTMLElement ).removeEventListener( 'click', nextStep );
			}
		};
	}, [ nextStep, currentStep, context ] );

	// Do not render unless this is the current step in the active tour.
	if ( ! currentStep || id !== currentStep.id ) {
		return null;
	}

	return (
		<Popover
			isVisible={ showTour }
			className={ classNames( className, 'guided-tour__popover' ) }
			context={ context }
			position={ currentStep.popoverPosition }
		>
			<h2 className="guided-tour__popover-heading">{ title ?? currentStep.title }</h2>
			<p className="guided-tour__popover-description">{ description ?? currentStep.description }</p>
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
							<Button className={ currentStep.classNames?.nextStepButton } onClick={ nextStep }>
								{ currentStepCount === stepsCount ? lastTourLabel : translate( 'Next' ) }
							</Button>
						) }
					</>
				</div>
			</div>
		</Popover>
	);
}
