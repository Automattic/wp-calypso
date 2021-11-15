/**
 * External Dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useLocale } from '@automattic/i18n-utils';
import { Button, Flex } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useState, createInterpolateElement, useMemo, useRef } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Icon, close } from '@wordpress/icons';
/**
 * Internal Dependencies
 */
import maximize from './icons/maximize';
import PackagedTour from './packaged-tour';
import WelcomeTourCard from './tour-card';
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

	return <FooTour />;
}

function WelcomeTourStep( { justMaximized, setJustMaximized } ) {
	return ( {
		steps,
		currentStepIndex,
		onDismiss,
		onNext,
		onPrevious,
		onMinimize,
		setInitialFocusedElement,
		onGoToStep,
	} ) => {
		const lastStepIndex = steps.length - 1;
		const isGutenboarding = window.calypsoifyGutenberg?.isGutenboarding;

		return (
			<WelcomeTourCard
				cardContent={ steps[ currentStepIndex ].meta }
				currentStepIndex={ currentStepIndex }
				justMaximized={ justMaximized }
				lastStepIndex={ lastStepIndex }
				onDismiss={ onDismiss }
				onMinimize={ onMinimize }
				setJustMaximized={ setJustMaximized }
				setCurrentStepIndex={ onGoToStep }
				onNextStepProgression={ onNext }
				onPreviousStepProgression={ onPrevious }
				isGutenboarding={ isGutenboarding }
				setInitialFocusedElement={ setInitialFocusedElement }
			/>
		);
	};
}

function WelcomeTourMinimized( { steps, onMaximize, onDismiss, currentStepIndex } ) {
	const lastStepIndex = steps.length - 1;
	const page = currentStepIndex + 1;
	const numberOfPages = lastStepIndex + 1;

	return (
		<Flex gap={ 0 } className="wpcom-editor-welcome-tour__minimized">
			<Button onClick={ onMaximize } aria-label={ __( 'Resume Tour', 'full-site-editing' ) }>
				<Flex gap={ 13 }>
					<p>
						{ createInterpolateElement(
							sprintf(
								/* translators: 1: current page number, 2: total number of pages */
								__( 'Resume welcome tour <span>(%1$d/%2$d)</span>', 'full-site-editing' ),
								page,
								numberOfPages
							),
							{
								span: <span className="wpcom-editor-welcome-tour__minimized-tour-index" />,
							}
						) }
					</p>
					<Icon icon={ maximize } size={ 24 } />
				</Flex>
			</Button>
			<Button
				onClick={ onDismiss( 'close-btn-minimized' ) }
				aria-label={ __( 'Close Tour', 'full-site-editing' ) }
			>
				<Icon icon={ close } size={ 24 } />
			</Button>
		</Flex>
	);
}

function WelcomeTour() {
	const localeSlug = useLocale();
	const { setShowWelcomeGuide } = useDispatch( 'automattic/wpcom-welcome-guide' );
	const [ justMaximized, setJustMaximized ] = useState( false );
	const isGutenboarding = window.calypsoifyGutenberg?.isGutenboarding;
	const isWelcomeTourNext = () => {
		return new URLSearchParams( document.location.search ).has( 'welcome-tour-next' );
	};
	const tourSteps = getTourSteps( localeSlug, isWelcomeTourNext() );

	// Preload card images
	tourSteps.forEach( ( step ) => ( new window.Image().src = step.meta.imgSrc ) );

	const tourConfig = {
		steps: tourSteps,
		renderers: {
			tourStep: WelcomeTourStep( { justMaximized, setJustMaximized } ),
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
			},
			className: 'foo-tour',
		},
	};

	return <PackagedTour config={ tourConfig } />;
}

export default LaunchWpcomWelcomeTour;
