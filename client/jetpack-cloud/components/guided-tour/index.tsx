import page from '@automattic/calypso-router';
import { Popover, Button } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getJetpackDashboardPreference as getPreference } from 'calypso/state/jetpack-agency-dashboard/selectors';
import { savePreference } from 'calypso/state/preferences/actions';
import { preferencesLastFetchedTimestamp } from 'calypso/state/preferences/selectors';

import './style.scss';

export interface Tour {
	target: string;
	title: string;
	description: string | JSX.Element;
	popoverPosition?:
		| 'top'
		| 'top right'
		| 'right'
		| 'bottom right'
		| 'bottom'
		| 'bottom left'
		| 'left'
		| 'top left';
	nextStepOnTargetClick?: string;
	forceShowSkipButton?: boolean;
}

interface Props {
	className?: string;
	tours: Tour[];
	preferenceName: string;
	redirectAfterTourEnds?: string;
	hideSteps?: boolean;
}

// This hook will return the async element matching the target selector.
// After timeout has passed, it will return null.
//
// @param target - The selector to match the element against
// @param timeoutDuration - The maximum duration (in milliseconds) to wait for the element
//
// @returns The element matching the target selector, or null if the timeout has passed
const useAsyncElement = ( target: string, timeoutDuration: number ): HTMLElement | null => {
	const [ asyncElement, setAsyncElement ] = useState< HTMLElement | null >( null );

	useEffect( () => {
		// Set timeout to ensure we don't wait too long for the element
		const endTime = Date.now() + timeoutDuration;

		const getAsyncElement = ( endTime: number ) => {
			const element = document.querySelector( target ) as HTMLElement | null;
			if ( element ) {
				setAsyncElement( element );
			} else if ( Date.now() < endTime ) {
				requestAnimationFrame( () => getAsyncElement( endTime ) );
			} else {
				setAsyncElement( null );
			}
		};

		getAsyncElement( endTime );
	}, [ target, timeoutDuration ] );

	return asyncElement;
};

const GuidedTour = ( {
	className,
	tours,
	preferenceName,
	redirectAfterTourEnds,
	hideSteps = false,
}: Props ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ currentStep, setCurrentStep ] = useState( 0 );
	const [ isVisible, setIsVisible ] = useState( false );

	const preference = useSelector( ( state ) => getPreference( state, preferenceName ) );
	const hasFetched = !! useSelector( preferencesLastFetchedTimestamp );

	const isDismissed = preference?.dismiss;

	const {
		title,
		description,
		target,
		popoverPosition,
		nextStepOnTargetClick,
		forceShowSkipButton = false,
	} = tours[ currentStep ];

	const targetElement = useAsyncElement( target, 3000 );

	useEffect( () => {
		if ( targetElement && ! isDismissed && hasFetched ) {
			setIsVisible( true );
			dispatch(
				recordTracksEvent( 'calypso_jetpack_cloud_start_tour', {
					tour: preferenceName,
				} )
			);
		}
	}, [ dispatch, isDismissed, preferenceName, targetElement, hasFetched ] );

	const endTour = useCallback( () => {
		dispatch( savePreference( preferenceName, { ...preference, dismiss: true } ) );
		dispatch(
			recordTracksEvent( 'calypso_jetpack_cloud_end_tour', {
				tour: preferenceName,
			} )
		);
		if ( redirectAfterTourEnds ) {
			page.redirect( redirectAfterTourEnds );
		}
	}, [ dispatch, preferenceName, preference, redirectAfterTourEnds ] );

	const nextStep = useCallback( () => {
		if ( currentStep < tours.length - 1 ) {
			setCurrentStep( currentStep + 1 );
		} else {
			endTour();
		}
	}, [ currentStep, tours.length, endTour ] );

	useEffect( () => {
		let nextStepClickTargetElement: Element | null = null;
		// We should wait for targetElement before attaching any events to advance to the next step
		if ( nextStepOnTargetClick && targetElement && ! isDismissed && hasFetched ) {
			// Find the target element using the nextStepOnTargetClick selector
			nextStepClickTargetElement = document.querySelector( nextStepOnTargetClick );
			if ( nextStepClickTargetElement ) {
				// Attach the event listener to the nextStepClickTargetElement
				nextStepClickTargetElement.addEventListener( 'click', nextStep );
			}
		}

		// Cleanup function to remove the event listener
		return () => {
			if ( nextStepClickTargetElement ) {
				nextStepClickTargetElement.removeEventListener( 'click', nextStep );
			}
		};
	}, [ nextStepOnTargetClick, nextStep, targetElement, isDismissed, hasFetched ] );

	if ( isDismissed ) {
		return null;
	}

	const lastTourLabel = tours.length === 1 ? translate( 'Got it' ) : translate( 'Done' );

	return (
		<Popover
			isVisible={ isVisible }
			className={ clsx( className, 'guided-tour__popover' ) }
			context={ targetElement }
			position={ popoverPosition }
		>
			<h2 className="guided-tour__popover-heading">{ title }</h2>
			<p className="guided-tour__popover-description">{ description }</p>
			<div className="guided-tour__popover-footer">
				<div>
					{
						// Show the step count if there are multiple steps and we're not on the last step, unless we explicitly choose to hide them
						tours.length > 1 && ! hideSteps && (
							<span className="guided-tour__popover-step-count">
								{ translate( 'Step %(currentStep)d of %(totalSteps)d', {
									args: { currentStep: currentStep + 1, totalSteps: tours.length },
								} ) }
							</span>
						)
					}
				</div>
				<div className="guided-tour__popover-footer-right-content">
					<>
						{ ( ( ! nextStepOnTargetClick && tours.length > 1 && currentStep < tours.length - 1 ) ||
							forceShowSkipButton ) && (
							// Show the skip button if there are multiple steps and we're not on the last step, unless we explicitly choose to add them
							<Button borderless onClick={ endTour }>
								{ translate( 'Skip' ) }
							</Button>
						) }
						{ ! nextStepOnTargetClick && (
							<Button onClick={ nextStep }>
								{ currentStep === tours.length - 1 ? lastTourLabel : translate( 'Next' ) }
							</Button>
						) }
					</>
				</div>
			</div>
		</Popover>
	);
};

export default GuidedTour;
