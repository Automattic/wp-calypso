import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useLocale } from '@automattic/i18n-utils';
import { START_WRITING_FLOW } from '@automattic/onboarding';
import { WpcomTourKit, usePrefetchTourAssets } from '@automattic/tour-kit';
import { isWithinBreakpoint } from '@automattic/viewport';
import { useDispatch, useSelect, dispatch } from '@wordpress/data';
import { useEffect, useMemo } from '@wordpress/element';
import useSiteIntent from '../../../dotcom-fse/lib/site-intent/use-site-intent';
import useSitePlan from '../../../dotcom-fse/lib/site-plan/use-site-plan';
import { selectors as starterPageTemplatesSelectors } from '../../../starter-page-templates/store';
import { selectors as wpcomBlockEditorNavSidebarSelectors } from '../../../wpcom-block-editor-nav-sidebar/src/store';
import { selectors as wpcomWelcomeGuideSelectors } from '../store';
import { getEditorType } from './get-editor-type';
import getTourSteps from './tour-steps';
import './style-tour.scss';
import type { SelectFromMap } from '@automattic/data-stores';
import type { WpcomConfig } from '@automattic/tour-kit';
import type { Rect, Placement } from '@popperjs/core';

type StarterPageTemplatesSelectors = SelectFromMap< typeof starterPageTemplatesSelectors >;
type WpcomBlockEditorNavSidebarSelectors = SelectFromMap<
	typeof wpcomBlockEditorNavSidebarSelectors
>;
type WpcomWelcomeGuideSelectors = SelectFromMap< typeof wpcomWelcomeGuideSelectors >;
type CoreEditPostPlaceholder = {
	isInserterOpened: ( ...args: unknown[] ) => boolean;
};
type CoreInterfacePlaceholder = {
	getActiveComplementaryArea: ( name: string ) => string;
};

function LaunchWpcomWelcomeTour() {
	const { show, isNewPageLayoutModalOpen, isManuallyOpened } = useSelect(
		( select ) => ( {
			show: (
				select( 'automattic/wpcom-welcome-guide' ) as WpcomWelcomeGuideSelectors
			 ).isWelcomeGuideShown(),
			// Handle the case where the new page pattern modal is initialized and open
			isNewPageLayoutModalOpen:
				select( 'automattic/starter-page-layouts' ) &&
				( select( 'automattic/starter-page-layouts' ) as StarterPageTemplatesSelectors ).isOpen(),
			isManuallyOpened: (
				select( 'automattic/wpcom-welcome-guide' ) as WpcomWelcomeGuideSelectors
			 ).isWelcomeGuideManuallyOpened(),
		} ),
		[]
	);
	const { siteIntent, siteIntentFetched } = useSiteIntent();
	const localeSlug = useLocale();
	const editorType = getEditorType();
	const { siteIntent: intent } = useSiteIntent();
	const isStartWritingFlow = intent === START_WRITING_FLOW;

	// Preload first card image (others preloaded after open state confirmed)
	usePrefetchTourAssets( [ getTourSteps( localeSlug, false, false, null, siteIntent )[ 0 ] ] );

	useEffect( () => {
		if ( isStartWritingFlow ) {
			return;
		}
		if ( ! show && ! isNewPageLayoutModalOpen ) {
			return;
		}

		if ( ! siteIntentFetched ) {
			return;
		}

		// Track opening of the Welcome Guide
		recordTracksEvent( 'calypso_editor_wpcom_tour_open', {
			is_gutenboarding: window.calypsoifyGutenberg?.isGutenboarding,
			is_manually_opened: isManuallyOpened,
			intent: siteIntent,
			editor_type: editorType,
		} );
	}, [
		isNewPageLayoutModalOpen,
		isManuallyOpened,
		show,
		siteIntent,
		siteIntentFetched,
		editorType,
		isStartWritingFlow,
	] );

	if ( ! show || isNewPageLayoutModalOpen || isStartWritingFlow ) {
		return null;
	}

	return <WelcomeTour { ...{ siteIntent } } />;
}

function WelcomeTour( { siteIntent }: { siteIntent?: string } ) {
	const sitePlan = useSitePlan( window._currentSiteId );
	const localeSlug = useLocale();
	const { setShowWelcomeGuide } = useDispatch( 'automattic/wpcom-welcome-guide' );
	const isGutenboarding = window.calypsoifyGutenberg?.isGutenboarding;
	const isWelcomeTourNext = () => {
		return new URLSearchParams( document.location.search ).has( 'welcome-tour-next' );
	};
	const isSiteEditor = useSelect( ( select ) => !! select( 'core/edit-site' ), [] );
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore Until `@types/wordpress__editor` (which has `@types/wordpress__core-data` as a dependency) can be upgraded to a version that includes `getCurrentTheme`
	// the function has existed for many years, and works as expected on wpcom and atomic
	const currentTheme = useSelect( ( select ) => select( 'core' ).getCurrentTheme() );
	const themeName = currentTheme?.name?.raw?.toLowerCase() ?? null;

	const tourSteps = getTourSteps(
		localeSlug,
		isWelcomeTourNext(),
		isSiteEditor,
		themeName,
		siteIntent
	);

	// Only keep Payment block step if user comes from seller simple flow
	if ( ! ( 'sell' === siteIntent && sitePlan && 'ecommerce-bundle' !== sitePlan.product_slug ) ) {
		const paymentBlockIndex = tourSteps.findIndex( ( step ) => step.slug === 'payment-block' );
		tourSteps.splice( paymentBlockIndex, 1 );
	}
	const { isInserterOpened, isSidebarOpened, isSettingsOpened } = useSelect(
		( select ) => ( {
			isInserterOpened: (
				select( 'core/edit-post' ) as CoreEditPostPlaceholder
			 ).isInserterOpened(),
			isSidebarOpened:
				(
					select( 'automattic/block-editor-nav-sidebar' ) as
						| WpcomBlockEditorNavSidebarSelectors
						| undefined
				 )?.isSidebarOpened() ?? false, // The sidebar store may not always be loaded.
			isSettingsOpened:
				( select( 'core/interface' ) as CoreInterfacePlaceholder ).getActiveComplementaryArea(
					'core/edit-post'
				) === 'edit-post/document',
		} ),
		[]
	);

	const isTourMinimized =
		isSidebarOpened ||
		( isWithinBreakpoint( '<782px' ) && ( isInserterOpened || isSettingsOpened ) );

	const editorType = getEditorType();

	const tourConfig: WpcomConfig = {
		steps: tourSteps,
		closeHandler: ( _steps, currentStepIndex, source ) => {
			recordTracksEvent( 'calypso_editor_wpcom_tour_dismiss', {
				is_gutenboarding: isGutenboarding,
				slide_number: currentStepIndex + 1,
				action: source,
				intent: siteIntent,
				editor_type: editorType,
			} );
			setShowWelcomeGuide( false, { openedManually: false } );
		},
		isMinimized: isTourMinimized,
		options: {
			tourRating: {
				enabled: true,
				useTourRating: () => {
					return useSelect(
						( select ) =>
							(
								select( 'automattic/wpcom-welcome-guide' ) as WpcomWelcomeGuideSelectors
							 ).getTourRating(),
						[]
					);
				},
				onTourRate: ( rating ) => {
					dispatch( 'automattic/wpcom-welcome-guide' ).setTourRating( rating );
					recordTracksEvent( 'calypso_editor_wpcom_tour_rate', {
						thumbs_up: rating === 'thumbs-up',
						is_gutenboarding: false,
						intent: siteIntent,
						editor_type: editorType,
					} );
				},
			},
			callbacks: {
				onMinimize: ( currentStepIndex ) => {
					recordTracksEvent( 'calypso_editor_wpcom_tour_minimize', {
						is_gutenboarding: isGutenboarding,
						slide_number: currentStepIndex + 1,
						intent: siteIntent,
						editor_type: editorType,
					} );
				},
				onMaximize: ( currentStepIndex ) => {
					recordTracksEvent( 'calypso_editor_wpcom_tour_maximize', {
						is_gutenboarding: isGutenboarding,
						slide_number: currentStepIndex + 1,
						intent: siteIntent,
						editor_type: editorType,
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
						intent: siteIntent,
						editor_type: editorType,
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
							offset: ( { placement, reference }: { placement: Placement; reference: Rect } ) => {
								if ( placement === 'bottom' ) {
									const boundary = document.querySelector( '.edit-post-header' );

									if ( ! boundary ) {
										return;
									}

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
			portalParentElement: document.getElementById( 'wpwrap' ),
		},
	};

	// Theme isn't immediately available, so we prevent rendering so the content doesn't switch after it is presented, since some content is based on theme
	if ( null === themeName ) {
		return null;
	}

	return <WpcomTourKit config={ tourConfig } />;
}

export default LaunchWpcomWelcomeTour;
