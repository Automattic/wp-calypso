import { userPreferenceMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
	Button,
	__experimentalHeading as Heading,
	MenuItem,
	Modal,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __, sprintf } from '@wordpress/i18n';
import { Icon, close } from '@wordpress/icons';
import clsx from 'clsx';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { Text } from '../../components/text';
import { useScheduleCall } from '../tiers/use-schedule-call';
import OnboardingTourBanner from './banner';
import { getOnboardingTourSections } from './sections';
import type { OnboardingTourSection, OnboardingTourSectionId } from './sections';

import './style.scss';

export const ONBOARDING_TOUR_HASH = '#onboarding-tour';

// Shared with the classic dashboard, so a tour left on one resumes on the other.
const CURRENT_SECTION_PREFERENCE = 'a4a-onboarding-tours-current-section';

function getSectionIdFromHash( sections: OnboardingTourSection[] ) {
	return sections.find(
		( section ) => window.location.hash === `${ ONBOARDING_TOUR_HASH }-${ section.id }`
	)?.id;
}

function replaceHash( hash: string ) {
	window.history.replaceState(
		window.history.state,
		'',
		`${ window.location.pathname }${ window.location.search }${ hash }`
	);
}

/**
 * Opens the tour from `#onboarding-tour` or `#onboarding-tour-{section}`, the links the
 * classic dashboard and sign-up already use. With `opensFromSignUpLink` off, the bare
 * sign-up link lands on the page instead, for pages that greet new agencies themselves.
 */
export function useOnboardingTour( { opensFromSignUpLink = true } = {} ) {
	const [ isOpen, setIsOpen ] = useState( false );
	// Read once, when the tour opens: the router can drop the hash before the page has the
	// agency data it needs to render the tour.
	const [ initialSectionId, setInitialSectionId ] = useState< OnboardingTourSectionId >();

	useEffect( () => {
		const handleHashChange = () => {
			if ( window.location.hash.startsWith( ONBOARDING_TOUR_HASH ) ) {
				setInitialSectionId( getSectionIdFromHash( getOnboardingTourSections() ) );
				setIsOpen( true );
			}
		};

		if ( ! opensFromSignUpLink && window.location.hash === ONBOARDING_TOUR_HASH ) {
			replaceHash( '' );
		} else {
			handleHashChange();
		}
		window.addEventListener( 'hashchange', handleHashChange );
		return () => window.removeEventListener( 'hashchange', handleHashChange );
	}, [ opensFromSignUpLink ] );

	const open = useCallback( () => {
		replaceHash( ONBOARDING_TOUR_HASH );
		setInitialSectionId( undefined );
		setIsOpen( true );
	}, [] );

	const onClose = useCallback( () => {
		replaceHash( '' );
		setIsOpen( false );
	}, [] );

	return { isOpen, initialSectionId, open, onClose };
}

interface OnboardingTourProps {
	agencyId?: number;
	initialSectionId?: OnboardingTourSectionId;
	onClose: () => void;
}

export default function OnboardingTour( {
	agencyId,
	initialSectionId,
	onClose,
}: OnboardingTourProps ) {
	const { recordTracksEvent } = useAnalytics();
	const navigate = useNavigate();
	const isMobile = useViewportMatch( 'mobile', '<' );
	const { scheduleCall, isLoading: isSchedulingCall } = useScheduleCall( agencyId );
	const { mutate: saveCurrentSection } = useMutation(
		userPreferenceMutation( CURRENT_SECTION_PREFERENCE )
	);

	const sections = useMemo( () => getOnboardingTourSections(), [] );
	const [ currentSectionId, setCurrentSectionId ] = useState< OnboardingTourSectionId >(
		() => initialSectionId ?? sections[ 0 ].id
	);

	const currentIndex = sections.findIndex( ( section ) => section.id === currentSectionId );
	const currentSection = sections[ currentIndex ];
	const isLastSection = currentIndex === sections.length - 1;

	useEffect( () => {
		recordTracksEvent( 'calypso_onboarding_tour_modal_section_view', {
			section: currentSectionId,
		} );
	}, [ currentSectionId, recordTracksEvent ] );

	const goToSection = ( sectionId: OnboardingTourSectionId, eventName: string ) => {
		setCurrentSectionId( sectionId );
		replaceHash( `${ ONBOARDING_TOUR_HASH }-${ sectionId }` );
		recordTracksEvent( eventName, { section: sectionId } );
	};

	const onNext = () => {
		recordTracksEvent( 'calypso_a4a_onboarding_tour_next_benefit_click', {
			section: currentSectionId,
		} );
		const next = sections[ currentIndex + 1 ];
		if ( next ) {
			setCurrentSectionId( next.id );
			replaceHash( `${ ONBOARDING_TOUR_HASH }-${ next.id }` );
		}
	};

	const onExplore = ( to: string ) => {
		recordTracksEvent( 'calypso_a4a_onboarding_tour_explore_feature_click', {
			section: currentSectionId,
		} );
		saveCurrentSection( currentSectionId );
		onClose();
		navigate( { to } );
	};

	const onEscape = () => {
		recordTracksEvent( 'calypso_onboarding_tour_modal_dismissed', { method: 'esc' } );
		onClose();
	};

	return (
		<Modal
			className="a4a-onboarding-tour-modal"
			onRequestClose={ onEscape }
			shouldCloseOnClickOutside={ false }
			__experimentalHideHeader
		>
			<div className="a4a-onboarding-tour">
				<nav className="a4a-onboarding-tour__aside" aria-label={ __( 'Tour sections' ) }>
					{ sections.map( ( section ) => (
						<MenuItem
							key={ section.id }
							className={ clsx( 'a4a-onboarding-tour__aside-item', {
								'is-active': section.id === currentSectionId,
							} ) }
							aria-current={ section.id === currentSectionId ? 'step' : undefined }
							onClick={ () =>
								goToSection( section.id, 'calypso_onboarding_tour_modal_section_menu_item_click' )
							}
						>
							{ section.title }
						</MenuItem>
					) ) }
				</nav>

				<div className="a4a-onboarding-tour__main">
					<Button
						className="a4a-onboarding-tour__close"
						label={ __( 'Close' ) }
						onClick={ () => {
							recordTracksEvent( 'calypso_onboarding_tour_modal_close_button_click' );
							onClose();
						} }
					>
						<Icon icon={ close } size={ 24 } />
					</Button>

					<div className="a4a-onboarding-tour__banner-container">
						{ sections.map( ( section ) => (
							<OnboardingTourBanner
								key={ section.id }
								sectionId={ section.id }
								isVisible={ section.id === currentSectionId }
							/>
						) ) }
					</div>

					<div className="a4a-onboarding-tour__content">
						<div
							className="a4a-onboarding-tour__slides"
							style={ { transform: `translateX(-${ currentIndex * 100 }%)` } }
						>
							{ sections.map( ( section ) => (
								<VStack
									key={ section.id }
									className="a4a-onboarding-tour__slide"
									spacing={ 4 }
									justify="flex-start"
									aria-hidden={ section.id !== currentSectionId }
								>
									<Heading level={ 2 } size={ 20 } weight={ 500 }>
										{ section.heading }
									</Heading>
									<VStack spacing={ 2 }>
										{ section.descriptions.map( ( description, index ) => (
											<Text key={ index } as="p" lineHeight="20px">
												{ description }
											</Text>
										) ) }
									</VStack>
									{ section.hint && (
										<Text as="p" lineHeight="20px" className="a4a-onboarding-tour__hint">
											{ section.hint }
										</Text>
									) }
								</VStack>
							) ) }
						</div>

						<div className="a4a-onboarding-tour__footer">
							{ isLastSection ? (
								<>
									<Button
										variant="secondary"
										onClick={ () => {
											recordTracksEvent( 'calypso_a4a_onboarding_tour_end_tour_click' );
											onClose();
										} }
									>
										{ __( 'End tour' ) }
									</Button>
									<Button
										variant="primary"
										isBusy={ isSchedulingCall }
										disabled={ isSchedulingCall }
										onClick={ () => {
											recordTracksEvent(
												'calypso_a4a_overview_growth_accelerator_schedule_call_click'
											);
											scheduleCall();
										} }
									>
										{ __( 'Schedule a call ↗' ) }
									</Button>
								</>
							) : (
								<>
									{ currentSection.explore && (
										<Button
											variant="secondary"
											onClick={ () => onExplore( currentSection.explore!.to ) }
										>
											{ currentSection.explore.label }
										</Button>
									) }
									<Button variant="primary" onClick={ onNext }>
										{ currentSection.nextLabel ?? __( 'Next benefit' ) }
									</Button>
								</>
							) }
						</div>

						{ isMobile && (
							<div className="a4a-onboarding-tour__dots">
								{ sections.map( ( section, index ) => (
									<button
										key={ section.id }
										type="button"
										className={ clsx( 'a4a-onboarding-tour__dot', {
											'is-active': section.id === currentSectionId,
										} ) }
										aria-label={ sprintf(
											/* translators: 1: section number, 2: number of sections. */
											__( 'Section %1$d of %2$d' ),
											index + 1,
											sections.length
										) }
										onClick={ () =>
											goToSection(
												section.id,
												'calypso_onboarding_tour_modal_section_menu_item_swipe'
											)
										}
									/>
								) ) }
							</div>
						) }
					</div>
				</div>
			</div>
		</Modal>
	);
}
