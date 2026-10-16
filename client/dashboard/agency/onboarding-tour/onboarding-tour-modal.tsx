import { useRouter } from '@tanstack/react-router';
import {
	Button,
	__experimentalHeading as Heading,
	Modal,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { getScrollContainer } from '@wordpress/dom';
import { __ } from '@wordpress/i18n';
import { close } from '@wordpress/icons';
import clsx from 'clsx';
import { useEffect, useMemo, useRef } from 'react';
import { ButtonStack } from '../../components/button-stack';
import { Notice } from '../../components/notice';
import PageDots from '../../components/page-dots';
import RouterLinkButton from '../../components/router-link-button';
import { Text } from '../../components/text';
import NewTabLabel from '../components/new-tab-label';
import glow from './images/tour/glow.jpg';
import { getOnboardingTourSections } from './sections';
import type { OnboardingTourLinks, OnboardingTourSectionId } from './sections';
import type { RecordTracksEvent } from '../tiers/types';
import type { ReactNode } from 'react';

import './style.scss';

export interface OnboardingTourModalProps {
	links: OnboardingTourLinks;
	sectionId: OnboardingTourSectionId;
	onSectionChange: ( sectionId: OnboardingTourSectionId ) => void;
	/** Called when an explore button leaves the tour, so the host can offer to resume it. */
	onExplore: ( sectionId: OnboardingTourSectionId ) => void;
	onClose: () => void;
	onScheduleCall: () => void;
	isSchedulingCall?: boolean;
	recordTracksEvent: RecordTracksEvent;
}

/**
 * The agency welcome tour: a section list beside one section at a time.
 */
export default function OnboardingTourModal( {
	links,
	sectionId: currentSectionId,
	onSectionChange: goToSection,
	onExplore,
	onClose,
	onScheduleCall,
	isSchedulingCall,
	recordTracksEvent,
}: OnboardingTourModalProps ) {
	const isMobile = useViewportMatch( 'small', '<' );
	const sections = useMemo( () => getOnboardingTourSections( links ), [ links ] );

	const currentIndex = sections.findIndex( ( { id } ) => id === currentSectionId );
	const currentSection = sections[ currentIndex ];
	const isLastSection = currentIndex === sections.length - 1;

	useEffect( () => {
		recordTracksEvent( 'calypso_onboarding_tour_modal_section_view', {
			section: currentSectionId,
		} );
	}, [ currentSectionId, recordTracksEvent ] );

	// Start each section at the top. The router restores the modal's saved scroll after every
	// hash change, so reset it in the next frame, once every listener has run; the event's
	// `hashChanged` is always false here. Only the modal's own scroll container is reset.
	const router = useRouter();
	const tourRef = useRef< HTMLDivElement >( null );
	useEffect( () => {
		let lastHash = router.state.location.hash;
		let frame = 0;
		const unsubscribe = router.subscribe( 'onRendered', ( { toLocation } ) => {
			if ( toLocation.hash === lastHash ) {
				return;
			}
			lastHash = toLocation.hash;
			cancelAnimationFrame( frame );
			frame = requestAnimationFrame( () => {
				const tour = tourRef.current;
				const container = getScrollContainer( tour );
				if ( tour && container && tour.closest( '[role="dialog"]' )?.contains( container ) ) {
					container.scrollTop = 0;
				}
			} );
		} );
		return () => {
			unsubscribe();
			cancelAnimationFrame( frame );
		};
	}, [ router ] );

	const onNext = () => {
		recordTracksEvent( 'calypso_a4a_onboarding_tour_next_benefit_click', {
			section: currentSectionId,
		} );
		goToSection( sections[ currentIndex + 1 ].id );
	};

	// On phones the buttons stack full width, the main one first; the labels centre themselves
	// in the stretched buttons.
	const label = ( text: string ) => (
		<span className="a4a-onboarding-tour-button-label">{ text }</span>
	);

	let primaryAction: ReactNode;
	let secondaryAction: ReactNode = null;
	if ( isLastSection ) {
		primaryAction = (
			<Button
				variant="primary"
				isBusy={ isSchedulingCall }
				disabled={ isSchedulingCall }
				onClick={ () => {
					recordTracksEvent( 'calypso_a4a_overview_growth_accelerator_schedule_call_click' );
					onScheduleCall();
				} }
			>
				<span className="a4a-onboarding-tour-button-label">
					<NewTabLabel>{ __( 'Schedule a call' ) }</NewTabLabel>
				</span>
			</Button>
		);
		secondaryAction = (
			<Button
				variant="secondary"
				onClick={ () => {
					recordTracksEvent( 'calypso_a4a_onboarding_tour_end_tour_click' );
					onClose();
				} }
			>
				{ label( __( 'End tour' ) ) }
			</Button>
		);
	} else {
		primaryAction = (
			<Button variant="primary" onClick={ onNext }>
				{ label( currentSection.nextLabel ?? __( 'Next benefit' ) ) }
			</Button>
		);
		if ( currentSection.explore ) {
			const { label: exploreLabel, href } = currentSection.explore;
			secondaryAction = (
				<RouterLinkButton
					to={ href }
					variant="secondary"
					onClick={ () => {
						recordTracksEvent( 'calypso_a4a_onboarding_tour_explore_feature_click', {
							section: currentSectionId,
						} );
						onExplore( currentSectionId );
						onClose();
					} }
				>
					{ label( exploreLabel ) }
				</RouterLinkButton>
			);
		}
	}

	return (
		<Modal
			title={ currentSection.title }
			onRequestClose={ () => {
				recordTracksEvent( 'calypso_onboarding_tour_modal_dismissed', { method: 'esc' } );
				onClose();
			} }
			shouldCloseOnClickOutside={ false }
			__experimentalHideHeader
		>
			<div className="a4a-onboarding-tour" ref={ tourRef }>
				{ ! isMobile && (
					<div className="a4a-onboarding-tour-aside">
						<VStack
							as="nav"
							spacing={ 1 }
							justify="flex-start"
							expanded={ false }
							aria-label={ __( 'Tour sections' ) }
						>
							{ sections.map( ( section ) => (
								<Button
									key={ section.id }
									variant="tertiary"
									__next40pxDefaultSize
									isPressed={ section.id === currentSectionId }
									aria-current={ section.id === currentSectionId ? 'step' : undefined }
									onClick={ () => {
										recordTracksEvent( 'calypso_onboarding_tour_modal_section_menu_item_click', {
											section: section.id,
										} );
										goToSection( section.id );
									} }
								>
									{ section.title }
								</Button>
							) ) }
						</VStack>
					</div>
				) }

				<div className="a4a-onboarding-tour-main">
					<div className="a4a-onboarding-tour-close">
						<Button
							icon={ close }
							label={ __( 'Close' ) }
							onClick={ () => {
								recordTracksEvent( 'calypso_onboarding_tour_modal_close_button_click' );
								onClose();
							} }
						/>
					</div>
					<div
						className="a4a-onboarding-tour-field"
						style={ { backgroundImage: `url(${ glow })` } }
					>
						{ sections.map( ( section ) => (
							<img
								key={ section.id }
								className={ clsx( 'a4a-onboarding-tour-drawing', {
									'is-visible': section.id === currentSectionId,
								} ) }
								src={ section.drawing }
								alt=""
							/>
						) ) }
					</div>
					<div className="a4a-onboarding-tour-content">
						<VStack spacing={ 4 } justify="flex-start">
							<VStack spacing={ 4 } justify="flex-start">
								<div className="a4a-onboarding-tour-slides">
									{ sections.map( ( section ) => (
										<div
											key={ section.id }
											className={ clsx( 'a4a-onboarding-tour-slide', {
												'is-current': section.id === currentSectionId,
											} ) }
											aria-hidden={ section.id !== currentSectionId }
										>
											<VStack spacing={ 4 } justify="flex-start">
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
													<Notice variant="info" density="high">
														{ section.hint }
													</Notice>
												) }
											</VStack>
										</div>
									) ) }
								</div>
							</VStack>

							<div className="a4a-onboarding-tour-actions">
								{ isMobile ? (
									<VStack spacing={ 2 }>
										{ primaryAction }
										{ secondaryAction }
										<PageDots
											count={ sections.length }
											current={ currentIndex }
											label={ __( 'Tour sections' ) }
											getDotLabel={ ( index ) => sections[ index ].title }
											onChange={ ( index ) => {
												recordTracksEvent(
													'calypso_onboarding_tour_modal_section_menu_item_swipe',
													{
														section: sections[ index ].id,
													}
												);
												goToSection( sections[ index ].id );
											} }
										/>
									</VStack>
								) : (
									<ButtonStack justify="flex-end">
										{ secondaryAction }
										{ primaryAction }
									</ButtonStack>
								) }
							</div>
						</VStack>
					</div>
				</div>
			</div>
		</Modal>
	);
}
