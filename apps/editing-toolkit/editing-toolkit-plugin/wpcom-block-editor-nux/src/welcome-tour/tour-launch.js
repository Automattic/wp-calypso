/**
 * External Dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useLocale } from '@automattic/i18n-utils';
import TourKit from '@automattic/tour-kit';
import { isMobile } from '@automattic/viewport';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useMemo } from '@wordpress/element';
/**
 * Internal Dependencies
 */
import useSiteIntent from '../../../dotcom-fse/lib/site-intent/use-site-intent';
import useSitePlan from '../../../dotcom-fse/lib/site-plan/use-site-plan';
import { usePrefetchTourAssets } from './hooks';
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
	const localeSlug = useLocale();

	// Preload first card image (others preloaded after open state confirmed)
	usePrefetchTourAssets( [ getTourSteps( localeSlug )[ 0 ] ] );

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

	return <WelcomeTour />;
}

function WelcomeTour() {
	const sitePlan = useSitePlan( window._currentSiteId );
	const localeSlug = useLocale();
	const intent = useSiteIntent();
	const { setShowWelcomeGuide } = useDispatch( 'automattic/wpcom-welcome-guide' );
	const isGutenboarding = window.calypsoifyGutenberg?.isGutenboarding;
	const isWelcomeTourNext = () => {
		return new URLSearchParams( document.location.search ).has( 'welcome-tour-next' );
	};
	const tourSteps = getTourSteps( localeSlug, isWelcomeTourNext() ).filter(
		( step ) => ! ( step.meta.isDesktopOnly && isMobile() )
	);

	// Preload card images
	usePrefetchTourAssets( tourSteps );

	// Only keep Payment block step if user comes from seller simple flow
	if ( ! ( 'sell' === intent && sitePlan && 'ecommerce-bundle' !== sitePlan.product_slug ) ) {
		const paymentBlockIndex = tourSteps.refindIndex( ( step ) => step.slug === 'payment-block' );
		tourSteps.splice( paymentBlockIndex, 1 );
	}

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
					recordTracksEvent( 'calypso_editor_wpcom_tour_maximize', {
						is_gutenboarding: isGutenboarding,
						slide_number: currentStepIndex + 1,
					} );
				},
				onStepViewOnce: ( currentStepIndex ) => {
					const lastStepIndex = tourSteps.length - 1;
					const { heading } = tourSteps[ currentStepIndex ].meta;

					recordTracksEvent( 'calypso_editor_wpcom_tour_slide_view', {
						slide_number: currentStepIndex + 1,
						is_last_slide: currentStepIndex === lastStepIndex,
						slide_heading: heading,
						is_gutenboarding: isGutenboarding,
					} );
				},
			},
			effects: {
				spotlight: isWelcomeTourNext()
					? {
							styles: {
								minWidth: '50px',
								minHeight: '50px',
								borderRadius: '2px',
							},
					  }
					: undefined,
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
			classNames: 'wpcom-editor-welcome-tour',
		},
	};

	return <TourKit config={ tourConfig } />;
}

export default LaunchWpcomWelcomeTour;
