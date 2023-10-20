import { Popover, Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getJetpackDashboardPreference as getPreference } from 'calypso/state/jetpack-agency-dashboard/selectors';
import { savePreference } from 'calypso/state/preferences/actions';
import { preferencesLastFetchedTimestamp } from 'calypso/state/preferences/selectors';

import './style.scss';

export interface Tour {
	target: string;
	title: string;
	description: string;
	popoverPosition?:
		| 'top'
		| 'top right'
		| 'right'
		| 'bottom right'
		| 'bottom'
		| 'bottom left'
		| 'left'
		| 'top left';
}

interface Props {
	tours: Tour[];
	preferenceName: string;
}

const GuidedTour = ( { tours, preferenceName }: Props ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ currentStep, setCurrentStep ] = useState( 0 );
	const [ targetElement, setTargetElement ] = useState< HTMLElement | null >( null );
	const [ isVisible, setIsVisible ] = useState( false );

	const preference = useSelector( ( state ) => getPreference( state, preferenceName ) );
	const hasFetched = !! useSelector( preferencesLastFetchedTimestamp );

	const isDismissed = preference?.dismiss;

	const { title, description, target, popoverPosition } = tours[ currentStep ];

	// Set the target element for the popover
	useEffect( () => {
		if ( target ) {
			const element = document.querySelector( target ) as HTMLElement | null;
			setTargetElement( element );
		}
	}, [ target ] );

	// Show the popover after a short delay to allow the popover to be positioned correctly
	useEffect( () => {
		if ( targetElement && ! isDismissed && hasFetched ) {
			setTimeout( () => {
				setIsVisible( true );
				dispatch(
					recordTracksEvent( 'calypso_jetpack_cloud_start_tour', {
						tour: preferenceName,
					} )
				);
			}, 100 );
		}
	}, [ dispatch, isDismissed, preferenceName, targetElement, hasFetched ] );

	const endTour = () => {
		dispatch( savePreference( preferenceName, { ...preference, dismiss: true } ) );
		dispatch(
			recordTracksEvent( 'calypso_jetpack_cloud_end_tour', {
				tour: preferenceName,
			} )
		);
	};

	const nextStep = () => {
		if ( currentStep < tours.length - 1 ) {
			setCurrentStep( currentStep + 1 );
		} else {
			endTour();
		}
	};

	if ( isDismissed ) {
		return null;
	}

	const lastTourLabel = tours.length === 1 ? translate( 'Got it' ) : translate( 'Done' );

	return (
		<Popover
			isVisible={ isVisible }
			context={ targetElement }
			className="guided-tour__popover"
			position={ popoverPosition }
		>
			<h2 className="guided-tour__popover-heading">{ title }</h2>
			<p className="guided-tour__popover-description">{ description }</p>
			<div className="guided-tour__popover-footer">
				<div>
					{
						// Show the step count if there are multiple steps and we're not on the last step
						tours.length > 1 && (
							<span className="guided-tour__popover-step-count">
								{ translate( 'Step %(currentStep)d of %(totalSteps)d', {
									args: { currentStep: currentStep + 1, totalSteps: tours.length },
								} ) }
							</span>
						)
					}
				</div>
				<div className="guided-tour__popover-footer-right-content">
					{
						// Show the skip button if there are multiple steps and we're not on the last step
						tours.length > 1 && currentStep < tours.length - 1 && (
							<Button borderless onClick={ endTour }>
								{ translate( 'Skip' ) }
							</Button>
						)
					}
					<Button onClick={ nextStep }>
						{ currentStep === tours.length - 1 ? lastTourLabel : translate( 'Next' ) }
					</Button>
				</div>
			</div>
		</Popover>
	);
};

export default GuidedTour;
