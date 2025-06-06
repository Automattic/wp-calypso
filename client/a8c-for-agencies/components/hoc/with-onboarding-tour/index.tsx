import { Snackbar } from '@wordpress/components';
import { Icon, layout } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { ComponentType, useCallback, useEffect } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import OnboardingTourModal from '../../onboarding-tour-modal';
import useCurrentOnboardingSection from './hooks/use-current-onboarding-section';
import useOnboardingTour, { ONBOARDING_TOUR_HASH } from './hooks/use-onboarding-tour';
import useOnboardingTourSections from './hooks/use-onboarding-tour-sections';

import './style.scss';

export function withOnboardingTour< T extends object >( WrappedComponent: ComponentType< T > ) {
	return function WithOnboardingTourWrapper( props: T ) {
		const translate = useTranslate();
		const dispatch = useDispatch();

		const { isOpen, onClose } = useOnboardingTour();

		const sections = useOnboardingTourSections();
		const { currentSection, removeCurrentSection } = useCurrentOnboardingSection();

		useEffect( () => {
			if ( currentSection && isOpen ) {
				removeCurrentSection();
			}
		}, [ currentSection, isOpen, removeCurrentSection ] );

		const onDismiss = useCallback( () => {
			dispatch( recordTracksEvent( 'calypso_a4a_onboarding_tour_snackbar_dismissed' ) );
			removeCurrentSection();
		}, [ dispatch, removeCurrentSection ] );

		return (
			<>
				<WrappedComponent { ...props } />
				{ isOpen && (
					<OnboardingTourModal onClose={ onClose }>
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
									window.location.hash = `${ ONBOARDING_TOUR_HASH }-${ currentSection }`;
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
