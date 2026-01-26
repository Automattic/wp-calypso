import { Snackbar } from '@wordpress/components';
import { Icon, layout } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { ComponentType, useCallback, useEffect, useState } from 'react';
import OnboardingTourModal from 'calypso/dashboard/components/onboarding-tour-modal';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import useCurrentOnboardingSection from './hooks/use-current-onboarding-section';
import useOnboardingTour, { ONBOARDING_TOUR_HASH } from './hooks/use-onboarding-tour';
import useOnboardingTourSections from './hooks/use-onboarding-tour-sections';

import './style.scss';

function getSectionIdFromHash(): string | undefined {
	const hash = window.location.hash;
	if ( hash.startsWith( `${ ONBOARDING_TOUR_HASH }-` ) ) {
		return hash.replace( `${ ONBOARDING_TOUR_HASH }-`, '' );
	}
	return undefined;
}

export function withOnboardingTour< T extends object >( WrappedComponent: ComponentType< T > ) {
	return function WithOnboardingTourWrapper( props: T ) {
		const translate = useTranslate();
		const dispatch = useDispatch();

		const { isOpen, onClose, openTour } = useOnboardingTour();

		const sections = useOnboardingTourSections();
		const { currentSection, removeCurrentSection } = useCurrentOnboardingSection();

		const [ activeSectionId, setActiveSectionId ] = useState(
			() => getSectionIdFromHash() ?? sections[ 0 ]?.id
		);

		useEffect( () => {
			if ( currentSection && isOpen ) {
				removeCurrentSection();
			}
		}, [ currentSection, isOpen, removeCurrentSection ] );

		const onDismiss = useCallback( () => {
			dispatch( recordTracksEvent( 'calypso_a4a_onboarding_tour_snackbar_dismissed' ) );
			removeCurrentSection();
		}, [ dispatch, removeCurrentSection ] );

		const handleSectionChange = useCallback(
			( sectionId: string ) => {
				setActiveSectionId( sectionId );
				window.history.pushState(
					window.history.state,
					'',
					`${ ONBOARDING_TOUR_HASH }-${ sectionId }`
				);
				dispatch(
					recordTracksEvent( 'calypso_a4a_onboarding_tour_modal_section_change', {
						section: sectionId,
					} )
				);
			},
			[ dispatch ]
		);

		return (
			<>
				<WrappedComponent { ...props } />
				{ isOpen && (
					<OnboardingTourModal
						onClose={ onClose }
						onSectionChange={ handleSectionChange }
						currentSectionId={ activeSectionId }
					>
						{ sections.map( ( section ) => (
							<OnboardingTourModal.Section key={ section.id } { ...section }>
								<OnboardingTourModal.SectionContent
									title={ section.content.title }
									descriptions={ section.content.descriptions }
									hint={ section.content.hint }
								/>
							</OnboardingTourModal.Section>
						) ) }
					</OnboardingTourModal>
				) }
				{ currentSection && (
					<Snackbar
						className="a4a-onboarding-tour-snackbar"
						actions={ [
							{
								label: translate( 'Continue tour' ),
								onClick: () => {
									setActiveSectionId( currentSection );
									openTour();
									window.history.pushState(
										window.history.state,
										'',
										`${ ONBOARDING_TOUR_HASH }-${ currentSection }`
									);
									dispatch(
										recordTracksEvent( 'calypso_a4a_onboarding_tour_snackbar_continue_clicked', {
											section: currentSection,
										} )
									);
								},
							},
						] }
						explicitDismiss
						onDismiss={ onDismiss }
						onRemove={ onDismiss }
						icon={ <Icon icon={ layout } /> }
					>
						{ translate( 'Pick up where you left off' ) }
					</Snackbar>
				) }
			</>
		);
	};
}
