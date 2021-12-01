/**
 * External Dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useLocale } from '@automattic/i18n-utils';
import TourKit from '@automattic/tour-kit';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useMemo } from '@wordpress/element';
/**
 * Internal Dependencies
 */
import PrefetchImage from './prefetch-image';
import { WelcomeTourContextProvider, useWelcomeTourContext } from './tour-context';
import WelcomeTourMinimized from './tour-minimized-renderer';
import WelcomeTourStep from './tour-step-renderer';
import getTourSteps from './tour-steps';

import './style-tour.scss';

function LaunchWpcomWelcomeTour() {
	const { show, isNewPageLayoutModalOpen, isManuallyOpened } = useSelect( ( select ) => ( {
		show: select( 'automattic/wpcom-welcome-guide' ).isWelcomeGuideShown(),
		// Handle the case where the new page pattern modal is initialized and open
		isNewPageLayoutModalOpen:
			select( 'automattic/starter-page-layouts' ) &&
			select( 'automattic/starter-page-layouts' ).isOpen(),
		isManuallyOpened: select( 'automattic/wpcom-welcome-guide' ).isWelcomeGuideManuallyOpened(),
	} ) );

	useEffect( () => {
		if ( ! show && ! isNewPageLayoutModalOpen ) {
			return;
		}

		// Track opening of the Welcome Guide
		recordTracksEvent( 'calypso_editor_wpcom_tour_open', {
			is_gutenboarding: window.calypsoifyGutenberg?.isGutenboarding,
			is_manually_opened: isManuallyOpened,
		} );
	}, [ isNewPageLayoutModalOpen, isManuallyOpened, show ] );

	if ( ! show || isNewPageLayoutModalOpen ) {
		return null;
	}

	return (
		<WelcomeTourContextProvider>
			<WelcomeTour />
		</WelcomeTourContextProvider>
	);
}

function WelcomeTour() {
	const localeSlug = useLocale();
	const { setShowWelcomeGuide } = useDispatch( 'automattic/wpcom-welcome-guide' );
	const isGutenboarding = window.calypsoifyGutenberg?.isGutenboarding;
	const isWelcomeTourNext = () => {
		return new URLSearchParams( document.location.search ).has( 'welcome-tour-next' );
	};
	const tourSteps = getTourSteps( localeSlug, isWelcomeTourNext() );
	const { setJustMaximized } = useWelcomeTourContext();

	// Preload card images
	tourSteps.forEach( ( step ) => <PrefetchImage asset={ step.meta.imgSrc } /> );

	const tourConfig = {
		steps: tourSteps,
		renderers: {
			tourStep: WelcomeTourStep,
			tourMinimized: WelcomeTourMinimized,
		},
		closeHandler: ( steps, currentStepIndex, source ) => {
			recordTracksEvent( 'calypso_editor_wpcom_tour_dismiss', {
				is_gutenboarding: isGutenboarding,
				slide_number: currentStepIndex + 1,
				action: source,
			} );
			setShowWelcomeGuide( false, { openedManually: false } );
		},
		options: {
			callbacks: {
				onMinimize: ( currentStepIndex ) => {
					recordTracksEvent( 'calypso_editor_wpcom_tour_minimize', {
						is_gutenboarding: isGutenboarding,
						slide_number: currentStepIndex + 1,
					} );
				},
				onMaximize: ( currentStepIndex ) => {
					setJustMaximized( true );
					recordTracksEvent( 'calypso_editor_wpcom_tour_maximize', {
						is_gutenboarding: isGutenboarding,
						slide_number: currentStepIndex + 1,
					} );
				},
			},
			effects: {
				__experimental__spotlight: isWelcomeTourNext(),
				arrowIndicator: false,
			},
			popperModifiers: [
				useMemo(
					() => ( {
						name: 'offset',
						options: {
							offset: ( { placement, reference } ) => {
								if ( placement === 'bottom' ) {
									const boundary = document.querySelector( '.edit-post-header' );
									const boundaryRect = boundary.getBoundingClientRect();
									const boundaryBottomY = boundaryRect.height + boundaryRect.y;
									const referenceBottomY = reference.height + reference.y;

									return [ 0, boundaryBottomY - referenceBottomY + 16 ];
								}
								return [ 0, 0 ];
							},
						},
					} ),
					[]
				),
			],
			className: 'wpcom-editor-welcome-tour',
		},
	};

	return <TourKit config={ tourConfig } />;
}

export default LaunchWpcomWelcomeTour;
