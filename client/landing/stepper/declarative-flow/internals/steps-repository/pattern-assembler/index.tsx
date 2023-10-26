import { getThemeIdFromStylesheet } from '@automattic/data-stores';
import {
	useSyncGlobalStylesUserConfig,
	getVariationTitle,
	getVariationType,
} from '@automattic/global-styles';
import { useLocale } from '@automattic/i18n-utils';
import { StepContainer, isSiteAssemblerFlow, NavigatorScreen } from '@automattic/onboarding';
import {
	__experimentalNavigatorProvider as NavigatorProvider,
	__experimentalUseNavigator as useNavigator,
} from '@wordpress/components';
import { compose } from '@wordpress/compose';
import { useDispatch, useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { useState, useRef, useMemo } from 'react';
import { createRecordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useDispatch as useReduxDispatch } from 'calypso/state';
import { activateOrInstallThenActivate } from 'calypso/state/themes/actions';
import { useSite } from '../../../../hooks/use-site';
import { useSiteIdParam } from '../../../../hooks/use-site-id-param';
import { useSiteSlugParam } from '../../../../hooks/use-site-slug-param';
import { SITE_STORE, ONBOARD_STORE } from '../../../../stores';
import { recordSelectedDesign, getAssemblerSource } from '../../analytics/record-design';
import { SITE_TAGLINE, NAVIGATOR_PATHS, INITIAL_SCREEN } from './constants';
import { PATTERN_ASSEMBLER_EVENTS } from './events';
import {
	useCurrentScreen,
	useCustomStyles,
	useDotcomPatterns,
	useGlobalStylesUpgradeProps,
	useInitialPath,
	usePatternCategories,
	usePatternsMapByCategory,
	useRecipe,
	useSyncNavigatorScreen,
	useIsNewSite,
} from './hooks';
import withNotices, { NoticesProps } from './notices/notices';
import PatternAssemblerContainer from './pattern-assembler-container';
import PatternLargePreview from './pattern-large-preview';
import ScreenActivation from './screen-activation';
import ScreenColorPalettes from './screen-color-palettes';
import ScreenConfirmation from './screen-confirmation';
import ScreenFontPairings from './screen-font-pairings';
import ScreenMain from './screen-main';
import ScreenPages from './screen-pages';
import ScreenPatternListPanel from './screen-pattern-list-panel';
import ScreenSections from './screen-sections';
import ScreenStyles from './screen-styles';
import ScreenUpsell from './screen-upsell';
import { encodePatternId, getShuffledPattern, injectCategoryToPattern } from './utils';
import withGlobalStylesProvider from './with-global-styles-provider';
import type { Pattern, PatternType } from './types';
import type { StepProps } from '../../types';
import type { OnboardSelect } from '@automattic/data-stores';
import type { DesignRecipe, Design } from '@automattic/design-picker/src/types';
import type { GlobalStylesObject } from '@automattic/global-styles';
import type { FC } from 'react';
import type { AnyAction } from 'redux';
import type { ThunkAction } from 'redux-thunk';
import './style.scss';

const PatternAssembler = ( props: StepProps & NoticesProps ) => {
	const { navigation, flow, stepName, noticeOperations, noticeUI } = props;

	const translate = useTranslate();
	const navigator = useNavigator();
	const [ sectionPosition, setSectionPosition ] = useState< number | null >( null );
	const wrapperRef = useRef< HTMLDivElement | null >( null );
	const [ activePosition, setActivePosition ] = useState( -1 );
	const [ surveyDismissed, setSurveyDismissed ] = useState( false );
	const { goBack, goNext, submit } = navigation;
	const { assembleSite } = useDispatch( SITE_STORE );
	const reduxDispatch = useReduxDispatch();
	const { setPendingAction } = useDispatch( ONBOARD_STORE );
	const selectedDesign = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedDesign(),
		[]
	);
	const intent = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getIntent(),
		[]
	);
	const site = useSite();
	const siteSlug = useSiteSlugParam();
	const siteId = useSiteIdParam();
	const siteSlugOrId = siteSlug ? siteSlug : siteId;
	const locale = useLocale();
	const isNewSite = useIsNewSite( flow );

	// The categories api triggers the ETK plugin before the PTK api request
	const categories = usePatternCategories( site?.ID );
	// Fetching curated patterns and categories from PTK api
	const dotcomPatterns = useDotcomPatterns( locale );
	const patternIds = useMemo(
		() => dotcomPatterns.map( ( pattern ) => encodePatternId( pattern.ID ) ),
		[ dotcomPatterns ]
	);
	const patternsMapByCategory = usePatternsMapByCategory( dotcomPatterns, categories );
	const {
		header,
		footer,
		sections,
		colorVariation,
		fontVariation,
		setHeader,
		setFooter,
		setSections,
		setColorVariation,
		setFontVariation,
		resetRecipe,
	} = useRecipe( site?.ID, dotcomPatterns, categories );

	const { shouldUnlockGlobalStyles, numOfSelectedGlobalStyles } = useCustomStyles( {
		siteID: site?.ID,
		hasColor: !! colorVariation,
		hasFont: !! fontVariation,
	} );

	const currentScreen = useCurrentScreen( { isNewSite, shouldUnlockGlobalStyles } );

	const stylesheet = selectedDesign?.recipe?.stylesheet || '';

	const recordTracksEvent = useMemo(
		() =>
			createRecordTracksEvent( {
				flow,
				step: stepName,
				intent,
				stylesheet,
				color_variation_title: getVariationTitle( colorVariation ),
				color_variation_type: getVariationType( colorVariation ),
				font_variation_title: getVariationTitle( fontVariation ),
				font_variation_type: getVariationType( fontVariation ),
				assembler_source: getAssemblerSource( selectedDesign ),
				has_global_styles_selected: numOfSelectedGlobalStyles > 0,
			} ),
		[ flow, stepName, intent, stylesheet, colorVariation, fontVariation, numOfSelectedGlobalStyles ]
	);

	const selectedVariations = useMemo(
		() => [ colorVariation, fontVariation ].filter( Boolean ) as GlobalStylesObject[],
		[ colorVariation, fontVariation ]
	);

	const [ pages, setPages ] = useState( [] );

	const syncedGlobalStylesUserConfig = useSyncGlobalStylesUserConfig( selectedVariations );

	useSyncNavigatorScreen();

	const siteInfo = {
		title: site?.name,
		tagline: site?.description || SITE_TAGLINE,
	};

	const getPatterns = ( patternType?: string | null ) => {
		let patterns = [ header, ...sections, footer ];

		if ( 'header' === patternType ) {
			patterns = [ header ];
		}
		if ( 'footer' === patternType ) {
			patterns = [ footer ];
		}
		if ( 'section' === patternType ) {
			patterns = sections;
		}

		return patterns.filter( ( pattern ) => pattern ) as Pattern[];
	};

	const trackEventPatternSelect = ( {
		patternType,
		patternId,
		patternName,
		patternCategory,
	}: {
		patternType: string;
		patternId: number;
		patternName: string;
		patternCategory: string | undefined;
	} ) => {
		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.PATTERN_SELECT_CLICK, {
			pattern_type: patternType,
			pattern_id: patternId,
			pattern_name: patternName,
			pattern_category: patternCategory,
		} );
	};

	const trackSubmit = () => {
		const patterns = getPatterns();
		const categories = Array.from( new Set( patterns.map( ( { category } ) => category?.name ) ) );

		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.CONTINUE_TO_EDITOR_CLICK, {
			pattern_types: [ header && 'header', sections.length && 'section', footer && 'footer' ]
				.filter( Boolean )
				.join( ',' ),
			pattern_ids: patterns.map( ( { ID } ) => ID ).join( ',' ),
			pattern_names: patterns.map( ( { name } ) => name ).join( ',' ),
			pattern_categories: categories.join( ',' ),
			category_count: categories.length,
			pattern_count: patterns.length,
		} );
		patterns.forEach( ( { ID, name, category } ) => {
			recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.PATTERN_FINAL_SELECT, {
				pattern_id: ID,
				pattern_name: name,
				pattern_category: category?.name,
			} );
		} );
	};

	const getDesign = () => ( {
		...selectedDesign,
		recipe: {
			...selectedDesign?.recipe,
			header_pattern_ids: header ? [ encodePatternId( header.ID ) ] : undefined,
			pattern_ids: sections.filter( Boolean ).map( ( pattern ) => encodePatternId( pattern.ID ) ),
			footer_pattern_ids: footer ? [ encodePatternId( footer.ID ) ] : undefined,
		} as DesignRecipe,
	} );

	const updateActivePatternPosition = ( position: number ) => {
		const patternPosition = header ? position + 1 : position;
		setActivePosition( Math.max( patternPosition, 0 ) );
	};

	const updateHeader = ( pattern: Pattern | null ) => {
		setHeader( pattern );
		updateActivePatternPosition( -1 );
		if ( pattern ) {
			noticeOperations.showPatternInsertedNotice( pattern );
		} else if ( header ) {
			noticeOperations.showPatternRemovedNotice( header );
		}
	};

	const activateFooterPosition = ( hasFooter: boolean ) => {
		const lastPosition = hasFooter ? sections.length : sections.length - 1;
		updateActivePatternPosition( lastPosition );
	};

	const updateFooter = ( pattern: Pattern | null ) => {
		setFooter( pattern );
		activateFooterPosition( !! pattern );
		if ( pattern ) {
			noticeOperations.showPatternInsertedNotice( pattern );
		} else if ( footer ) {
			noticeOperations.showPatternRemovedNotice( footer );
		}
	};

	const replaceSection = ( pattern: Pattern, position: number | null = sectionPosition ) => {
		if ( position !== null ) {
			setSections( [
				...sections.slice( 0, position ),
				pattern,
				...sections.slice( position + 1 ),
			] );
			updateActivePatternPosition( position );
			noticeOperations.showPatternInsertedNotice( pattern );
		}
	};

	const addSection = ( pattern: Pattern ) => {
		setSections( [ ...( sections as Pattern[] ), pattern ] );
		updateActivePatternPosition( sections.length );
		noticeOperations.showPatternInsertedNotice( pattern );
	};

	const deleteSection = ( position: number ) => {
		noticeOperations.showPatternRemovedNotice( sections[ position ] );
		setSections( [ ...sections.slice( 0, position ), ...sections.slice( position + 1 ) ] );
		updateActivePatternPosition( position );
	};

	const moveDownSection = ( position: number ) => {
		const section = sections[ position ];
		setSections( [
			...sections.slice( 0, position ),
			...sections.slice( position + 1, position + 2 ),
			section,
			...sections.slice( position + 2 ),
		] );
		updateActivePatternPosition( position + 1 );
	};

	const moveUpSection = ( position: number ) => {
		const section = sections[ position ];
		setSections( [
			...sections.slice( 0, position - 1 ),
			section,
			...sections.slice( position - 1, position ),
			...sections.slice( position + 1 ),
		] );
		updateActivePatternPosition( position - 1 );
	};

	const onSelect = (
		type: PatternType,
		selectedPattern: Pattern | null,
		selectedCategory?: string | null
	) => {
		if ( selectedPattern ) {
			injectCategoryToPattern( selectedPattern, categories, selectedCategory );

			trackEventPatternSelect( {
				patternType: type,
				patternId: selectedPattern.ID,
				patternName: selectedPattern.name,
				patternCategory: selectedPattern.category?.name,
			} );

			if ( 'section' === type ) {
				if ( sectionPosition !== null ) {
					replaceSection( selectedPattern );
				} else {
					addSection( selectedPattern );
				}
			}
		}

		if ( 'header' === type ) {
			updateHeader( selectedPattern );
		}
		if ( 'footer' === type ) {
			updateFooter( selectedPattern );
		}
	};

	const onSubmit = () => {
		const design = getDesign() as Design;
		const stylesheet = design.recipe?.stylesheet ?? '';
		const themeId = getThemeIdFromStylesheet( stylesheet );
		const hasBlogPatterns = !! sections.find(
			( { categories } ) => categories[ 'posts' ] || categories[ 'blog' ]
		);

		if ( ! siteSlugOrId || ! site?.ID || ! themeId ) {
			return;
		}

		setPendingAction( () =>
			Promise.resolve()
				.then( () =>
					reduxDispatch(
						activateOrInstallThenActivate(
							themeId,
							site?.ID,
							'assembler',
							false,
							false
						) as ThunkAction< PromiseLike< string >, any, any, AnyAction >
					)
				)
				.then( ( activeThemeStylesheet: string ) =>
					assembleSite( siteSlugOrId, activeThemeStylesheet, {
						homeHtml: sections.map( ( pattern ) => pattern.html ).join( '' ),
						headerHtml: header?.html,
						footerHtml: footer?.html,
						globalStyles: syncedGlobalStylesUserConfig,
						// Newly created sites with blog patterns reset the starter content created from the default Headstart annotation
						// TODO: Ask users whether they want all their pages and posts to be replaced with the content from theme demo site
						shouldResetContent: isNewSite && hasBlogPatterns,
						// All sites using the assembler set the option wpcom_site_setup
						siteSetupOption: design.is_virtual ? 'assembler-virtual-theme' : 'assembler',
					} )
				)
		);

		recordSelectedDesign( { flow, intent, design } );
		trackSubmit();
		submit?.();
	};

	const onContinue = () => {
		if ( ! currentScreen.nextScreen ) {
			onSubmit();
			return;
		}

		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.SCREEN_CONTINUE_CLICK, {
			screen_from: currentScreen.name,
			screen_to: currentScreen.nextScreen.name,
		} );

		navigator.goTo( currentScreen.nextScreen.initialPath, {
			// We have to replace the path if the screens of previous and next are the same.
			// Otherwise, the behavior of the Back button might be weird when you navigate
			// to the current screen again.
			replace: currentScreen.previousScreen?.name === currentScreen.nextScreen?.name,
		} );
	};

	const globalStylesUpgradeProps = useGlobalStylesUpgradeProps( {
		flowName: flow,
		stepName,
		nextScreenName: isNewSite ? 'confirmation' : 'activation',
		onUpgradeLater: onContinue,
		recordTracksEvent,
	} );

	const getBackLabel = () => {
		if ( ! currentScreen.previousScreen ) {
			return undefined;
		}

		return translate( 'Back to %(pageTitle)s', {
			args: {
				pageTitle: currentScreen.previousScreen.backLabel || currentScreen.previousScreen.title,
			},
		} );
	};

	const onBack = () => {
		// Go back to the previous screen
		if ( currentScreen.previousScreen ) {
			if ( navigator.location.isInitial && currentScreen.name !== INITIAL_SCREEN ) {
				navigator.goTo( currentScreen.previousScreen.initialPath, { replace: true } );
			} else {
				navigator.goBack();
			}

			recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.SCREEN_BACK_CLICK, {
				screen_from: currentScreen.name,
				screen_to: currentScreen.previousScreen.name,
			} );
			return;
		}

		// Go back to the previous step
		const patterns = getPatterns();
		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.BACK_CLICK, {
			has_selected_patterns: patterns.length > 0,
			pattern_count: patterns.length,
		} );

		resetRecipe();
		goBack?.();
	};

	const onActivate = () => {
		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.SCREEN_ACTIVATION_ACTIVATE_CLICK );
		onContinue();
	};

	const onConfirm = () => {
		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.SCREEN_CONFIRMATION_CONFIRM_CLICK );
		onContinue();
	};

	const onMainItemSelect = ( name: string ) => {
		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.MAIN_ITEM_SELECT, { name } );
		if ( 'header' === name ) {
			return updateActivePatternPosition( -1 );
		}
		if ( 'footer' === name ) {
			return activateFooterPosition( !! footer );
		}
	};

	const onDeleteSection = ( position: number ) => {
		deleteSection( position );
		setSectionPosition( null );
	};

	const onMoveUpSection = ( position: number ) => {
		moveUpSection( position );
	};

	const onMoveDownSection = ( position: number ) => {
		moveDownSection( position );
	};

	const onDeleteHeader = () => onSelect( 'header', null );

	const onDeleteFooter = () => onSelect( 'footer', null );

	const onShuffle = ( type: string, pattern: Pattern, position?: number ) => {
		const availableCategory = Object.keys( pattern.categories ).find(
			( category ) => patternsMapByCategory[ category ]
		);
		const selectedCategory = pattern.category?.name || availableCategory || '';
		const patterns = patternsMapByCategory[ selectedCategory ];
		const shuffledPattern = getShuffledPattern( patterns, pattern );
		injectCategoryToPattern( shuffledPattern, categories, selectedCategory );

		if ( type === 'header' ) {
			updateHeader( shuffledPattern );
		} else if ( type === 'footer' ) {
			updateFooter( shuffledPattern );
		} else {
			replaceSection( shuffledPattern, position );
		}
	};

	const onScreenColorsSelect = ( variation: GlobalStylesObject | null ) => {
		setColorVariation( variation );
		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.SCREEN_COLORS_PREVIEW_CLICK, {
			color_variation_title: getVariationTitle( variation ),
			color_variation_type: getVariationType( variation ),
		} );
	};

	const onScreenFontsSelect = ( variation: GlobalStylesObject | null ) => {
		setFontVariation( variation );
		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.SCREEN_FONTS_PREVIEW_CLICK, {
			font_variation_title: getVariationTitle( variation ),
			font_variation_type: getVariationType( variation ),
		} );
	};

	const onScreenPagesSelect = ( page: string ) => {
		if ( pages.includes( page ) ) {
			setPages( pages.filter( ( item ) => item !== page ) );
			recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.SCREEN_PAGES_REMOVE_PAGE, { page } );
		} else {
			setPages( [ ...pages, page ] );
			recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.SCREEN_PAGES_ADD_PAGE, { page } );
		}
	};

	if ( ! site?.ID || ! selectedDesign ) {
		return null;
	}

	const stepContent = (
		<div className="pattern-assembler__wrapper" ref={ wrapperRef } tabIndex={ -1 }>
			{ noticeUI }
			<div className="pattern-assembler__sidebar">
				<NavigatorScreen path={ NAVIGATOR_PATHS.MAIN } partialMatch>
					<ScreenMain
						onMainItemSelect={ onMainItemSelect }
						surveyDismissed={ surveyDismissed }
						setSurveyDismissed={ setSurveyDismissed }
						sectionsCount={ sections.length }
						hasHeader={ !! header }
						hasFooter={ !! footer }
						onContinueClick={ onContinue }
					/>
				</NavigatorScreen>

				<NavigatorScreen path={ NAVIGATOR_PATHS.SECTIONS } partialMatch>
					<ScreenSections
						categories={ categories }
						patternsMapByCategory={ patternsMapByCategory }
						sections={ sections }
						onContinueClick={ onContinue }
						recordTracksEvent={ recordTracksEvent }
					/>
				</NavigatorScreen>

				<NavigatorScreen path={ NAVIGATOR_PATHS.STYLES } partialMatch>
					<ScreenStyles
						onMainItemSelect={ onMainItemSelect }
						onContinueClick={ onContinue }
						recordTracksEvent={ recordTracksEvent }
						hasColor={ !! colorVariation }
						hasFont={ !! fontVariation }
					/>
				</NavigatorScreen>

				<NavigatorScreen path={ NAVIGATOR_PATHS.PAGES } partialMatch>
					<ScreenPages
						selectedPages={ pages }
						onSelect={ onScreenPagesSelect }
						onContinueClick={ onContinue }
						recordTracksEvent={ recordTracksEvent }
					/>
				</NavigatorScreen>

				<NavigatorScreen path={ NAVIGATOR_PATHS.ACTIVATION } className="screen-activation">
					<ScreenActivation onActivate={ onActivate } />
				</NavigatorScreen>

				<NavigatorScreen path={ NAVIGATOR_PATHS.CONFIRMATION } className="screen-confirmation">
					<ScreenConfirmation onConfirm={ onConfirm } />
				</NavigatorScreen>

				<NavigatorScreen path={ NAVIGATOR_PATHS.UPSELL } className="screen-upsell">
					<ScreenUpsell
						{ ...globalStylesUpgradeProps }
						numOfSelectedGlobalStyles={ numOfSelectedGlobalStyles }
					/>
				</NavigatorScreen>
			</div>
			<div className="pattern-assembler__sidebar-panel">
				<NavigatorScreen path={ NAVIGATOR_PATHS.MAIN_PATTERNS }>
					<ScreenPatternListPanel
						categories={ categories }
						selectedHeader={ header }
						selectedSections={ sections }
						selectedFooter={ footer }
						patternsMapByCategory={ patternsMapByCategory }
						onSelect={ onSelect }
						recordTracksEvent={ recordTracksEvent }
						isNewSite={ isNewSite }
					/>
				</NavigatorScreen>

				<NavigatorScreen path={ NAVIGATOR_PATHS.SECTIONS_PATTERNS }>
					<ScreenPatternListPanel
						categories={ categories }
						selectedHeader={ header }
						selectedSections={ sections }
						selectedFooter={ footer }
						patternsMapByCategory={ patternsMapByCategory }
						onSelect={ onSelect }
						recordTracksEvent={ recordTracksEvent }
						isNewSite={ isNewSite }
					/>
				</NavigatorScreen>

				<NavigatorScreen path={ NAVIGATOR_PATHS.STYLES_COLORS }>
					<ScreenColorPalettes
						siteId={ site?.ID }
						stylesheet={ stylesheet }
						selectedColorPaletteVariation={ colorVariation }
						onSelect={ onScreenColorsSelect }
					/>
				</NavigatorScreen>
				<NavigatorScreen path={ NAVIGATOR_PATHS.STYLES_FONTS }>
					<ScreenFontPairings
						siteId={ site?.ID }
						stylesheet={ stylesheet }
						selectedFontPairingVariation={ fontVariation }
						onSelect={ onScreenFontsSelect }
					/>
				</NavigatorScreen>
			</div>
			<PatternLargePreview
				header={ header }
				sections={ sections }
				footer={ footer }
				activePosition={ activePosition }
				onDeleteSection={ onDeleteSection }
				onMoveUpSection={ onMoveUpSection }
				onMoveDownSection={ onMoveDownSection }
				onDeleteHeader={ onDeleteHeader }
				onDeleteFooter={ onDeleteFooter }
				onShuffle={ onShuffle }
				recordTracksEvent={ recordTracksEvent }
				isNewSite={ isNewSite }
			/>
		</div>
	);

	return (
		<StepContainer
			stepName="pattern-assembler"
			stepSectionName={ currentScreen.name }
			backLabelText={
				isSiteAssemblerFlow( flow ) && navigator.location.path?.startsWith( NAVIGATOR_PATHS.MAIN )
					? translate( 'Back to themes' )
					: getBackLabel()
			}
			goBack={ onBack }
			goNext={ goNext }
			isHorizontalLayout={ false }
			isFullLayout={ true }
			hideSkip={ true }
			stepContent={
				<PatternAssemblerContainer
					siteId={ site?.ID }
					stylesheet={ stylesheet }
					patternIds={ patternIds }
					siteInfo={ siteInfo }
					isNewSite={ isNewSite }
				>
					{ stepContent }
				</PatternAssemblerContainer>
			}
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

const PatternAssemblerStep = ( props: StepProps & NoticesProps ) => {
	const initialPath = useInitialPath();

	return (
		<NavigatorProvider initialPath={ initialPath } tabIndex={ -1 }>
			<PatternAssembler { ...props } />
		</NavigatorProvider>
	);
};

export default compose(
	withGlobalStylesProvider,
	withNotices
)( PatternAssemblerStep ) as FC< StepProps >;
