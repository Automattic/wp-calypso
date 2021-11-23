/**
 * External Dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useLocale } from '@automattic/i18n-utils';
import PackagedTour from '@automattic/packaged-tour';
import { Button, Flex } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useMemo, useState } from '@wordpress/element';
import { previous, next, close } from '@wordpress/icons';
/**
 * Internal Dependencies
 */
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

	const localeSlug = useLocale();
	// Preload first card image (others preloaded after open state confirmed)
	new window.Image().src = getTourSteps( localeSlug )[ 0 ].meta.imgSrc;

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
			<BarTour />
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
	tourSteps.forEach( ( step ) => ( new window.Image().src = step.meta.imgSrc ) );

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

	return <PackagedTour config={ tourConfig } />;
}

function FooTour() {
	const [ showTour, setShowTour ] = useState( true );

	const config = {
		steps: [
			{
				referenceElements: {
					desktop:
						'.edit-post-header .edit-post-header__toolbar .components-button.edit-post-header-toolbar__inserter-toggle',
				},
				meta: {
					description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
				},
			},
			{
				meta: {
					description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
				},
			},
		],
		closeHandler: () => setShowTour( false ),
		renderers: {
			tourStep: ( {
				steps,
				currentStepIndex,
				setInitialFocusedElement,
				onNext,
				onPrevious,
				onDismiss,
			} ) => {
				return (
					<>
						<Flex justify={ 'right' }>
							<Button onClick={ onPrevious } icon={ previous } />
							<Button onClick={ onNext } icon={ next } ref={ setInitialFocusedElement } />
							<Button onClick={ onDismiss( 'close-btn' ) } icon={ close } />
						</Flex>
						<p>{ steps[ currentStepIndex ].meta.description }</p>
					</>
				);
			},
			tourMinimized: () => null,
		},
	};

	if ( ! showTour ) {
		return null;
	}

	return <PackagedTour config={ config } />;
}

function BarTour() {
	const { setShowWelcomeGuide } = useDispatch( 'automattic/wpcom-welcome-guide' );

	const tourConfig = {
		closeHandler: () => {
			setShowWelcomeGuide( false, { openedManually: false } );
		},
		steps: [
			{
				meta: {
					description: 'I am a step.',
				},
			},
			{
				referenceElements: {
					mobile:
						'.edit-post-header .edit-post-header__toolbar .components-button.edit-post-header-toolbar__inserter-toggle',
					desktop:
						'.edit-post-header .edit-post-header__toolbar .components-button.edit-post-header-toolbar__inserter-toggle',
				},
				meta: {
					description: 'I am a step.',
				},
			},
			{
				referenceElements: {
					mobile:
						'.edit-post-header .edit-post-header__settings .interface-pinned-items > button:nth-child(1)',
					desktop:
						'.edit-post-header .edit-post-header__settings .interface-pinned-items > button:nth-child(1)',
				},
				meta: {
					description: 'I am a step.',
				},
			},
		],
		renderers: {
			tourStep: function TourStep( { steps, currentStepIndex, setInitialFocusedElement } ) {
				const styles = {
					width: '300px',
					padding: '50px 0',
					textAlign: 'center',
				};

				return (
					<div style={ styles }>
						<p>{ steps[ currentStepIndex ].meta.description }</p>
						<button ref={ setInitialFocusedElement }>{ currentStepIndex }</button>
					</div>
				);
			},
			tourMinimized: () => null,
		},
		options: {
			effects: {
				arrowIndicator: true,
				__experimental__spotlight: false,
				overlay: false,
			},
			className: 'foo-tour',
		},
	};

	return <PackagedTour config={ tourConfig } />;
}

export default LaunchWpcomWelcomeTour;
