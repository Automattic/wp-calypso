import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	Button,
	CardBody,
	Popover,
} from '@wordpress/components';
import { sprintf, __ } from '@wordpress/i18n';
import { closeSmall } from '@wordpress/icons';
import { useState, useContext, useEffect } from 'react';
import { SectionHeader } from '../../section-header';
import { GuidedTourContext } from '../context';
import type { ComponentProps, CSSProperties } from 'react';

// This hook will return the async element matching the target selector.
// After timeout has passed, it will return null.
const useAsyncElement = (
	selector: string | undefined,
	timeoutDuration: number = 3000
): HTMLElement | null => {
	const [ asyncElement, setAsyncElement ] = useState< HTMLElement | null >( null );

	useEffect( () => {
		// Set timeout to ensure we don't wait too long for the element
		const endTime = Date.now() + timeoutDuration;

		const getAsyncElement = ( endTime: number ) => {
			if ( ! selector ) {
				return;
			}

			const element = document.querySelector( selector ) as HTMLElement | null;
			if ( element ) {
				setAsyncElement( element );
			} else if ( Date.now() < endTime ) {
				requestAnimationFrame( () => getAsyncElement( endTime ) );
			} else {
				setAsyncElement( null );
			}
		};

		getAsyncElement( endTime );
	}, [ selector, timeoutDuration ] );

	return asyncElement;
};

/**
 * Renders a single step in a guided tour.
 */
export function GuidedTourStep( {
	id,
	target,
	selector,
	placement,
	inline,
	popoverStyle,
}: {
	id: string;
	target?: HTMLElement | null;
	selector?: string;
	placement?: ComponentProps< typeof Popover >[ 'placement' ];
	inline?: boolean;
	popoverStyle?: CSSProperties;
} ) {
	const {
		guidedTours,
		currentStep,
		totalSteps,
		isCompleted,
		isSkippable,
		startTour,
		endTour,
		previousStep,
		nextStep,
	} = useContext( GuidedTourContext );

	const isActive = guidedTours[ currentStep ]?.id === id;
	const currentTour = guidedTours.find( ( guidedTour ) => guidedTour.id === id );
	const targetElement = useAsyncElement( selector );
	const anchor = target || targetElement;

	const renderNext = () => {
		if ( currentStep + 1 === totalSteps ) {
			return totalSteps === 1 ? __( 'Got it' ) : __( 'Finish' );
		}

		return __( 'Next' );
	};

	// Record an event when the tour starts
	useEffect( () => {
		if ( anchor && currentStep === 0 && isActive ) {
			startTour();
		}
	}, [ anchor, currentStep, isActive, startTour ] );

	// Do not render unless this is the current step in the active tour.
	if ( ! currentTour || ! isActive || isCompleted ) {
		return null;
	}

	return (
		<Popover
			isVisible={ isActive }
			placement={ placement }
			anchor={ anchor }
			offset={ 10 }
			noArrow={ false }
			shift
			resize={ false }
			focusOnMount={ false }
			inline={ inline }
			style={ { padding: '0 16px', zIndex: inline ? 1 : undefined, ...popoverStyle } }
		>
			<CardBody style={ { width: 'min(80vw, 350px)' } }>
				<VStack spacing={ 6 }>
					<VStack spacing={ 2 }>
						<HStack justify="space-between">
							<SectionHeader title={ currentTour.title } level={ 3 } />
							{ totalSteps > 1 && currentStep + 1 < totalSteps && isSkippable && (
								<Button icon={ closeSmall } iconSize={ 24 } onClick={ endTour } />
							) }
						</HStack>
						<Text as="p" lineHeight="20px">
							{ currentTour.description }
						</Text>
					</VStack>
					<HStack justify="space-between">
						{ totalSteps > 1 && (
							<Text variant="muted" size={ 12 } style={ { flexShrink: 0 } }>
								{ sprintf(
									// translators: %(currentStep)s is the number of the current step and %(totalSteps)s is the number of total steps.
									__( '%(currentStep)s of %(totalSteps)s' ),
									{
										currentStep: currentStep + 1,
										totalSteps,
									}
								) }
							</Text>
						) }
						<HStack spacing={ 3 } justify="flex-end">
							{ currentStep > 0 && (
								<Button variant="tertiary" size="compact" onClick={ () => previousStep() }>
									{ __( 'Previous' ) }
								</Button>
							) }
							<Button variant="primary" size="compact" onClick={ () => nextStep() }>
								{ renderNext() }
							</Button>
						</HStack>
					</HStack>
				</VStack>
			</CardBody>
		</Popover>
	);
}
