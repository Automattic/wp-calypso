import {
	useSyncGlobalStylesUserConfig,
	getVariationTitle,
	getVariationType,
} from '@automattic/global-styles';
import { useLocale } from '@automattic/i18n-utils';
import { StepContainer, isSiteAssemblerFlow, isSiteSetupFlow } from '@automattic/onboarding';
import {
	__experimentalNavigatorProvider as NavigatorProvider,
	__experimentalNavigatorScreen as NavigatorScreen,
	__experimentalUseNavigator as useNavigator,
} from '@wordpress/components';
import { compose } from '@wordpress/compose';
import { useDispatch, useSelect } from '@wordpress/data';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useState, useRef, useMemo } from 'react';
import PremiumGlobalStylesUpgradeModal from 'calypso/components/premium-global-styles-upgrade-modal';
import { createRecordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useDispatch as useReduxDispatch } from 'calypso/state';
import { activateOrInstallThenActivate } from 'calypso/state/themes/actions';
import { getThemeIdFromStylesheet } from 'calypso/state/themes/utils';
import { useQuery } from '../../../../hooks/use-query';
import { useSite } from '../../../../hooks/use-site';
import { useSiteIdParam } from '../../../../hooks/use-site-id-param';
import { useSiteSlugParam } from '../../../../hooks/use-site-slug-param';
import { SITE_STORE, ONBOARD_STORE } from '../../../../stores';
import { recordSelectedDesign, getAssemblerSource } from '../../analytics/record-design';
import { SITE_TAGLINE, NAVIGATOR_PATHS, CATEGORY_ALL_SLUG } from './constants';
import { PATTERN_ASSEMBLER_EVENTS } from './events';
import useCategoryAll from './hooks/use-category-all';
import useDotcomPatterns from './hooks/use-dotcom-patterns';
import useGlobalStylesUpgradeModal from './hooks/use-global-styles-upgrade-modal';
import usePatternCategories from './hooks/use-pattern-categories';
import usePatternsMapByCategory from './hooks/use-patterns-map-by-category';
import { usePrefetchImages } from './hooks/use-prefetch-images';
import useRecipe from './hooks/use-recipe';
import withNotices, { NoticesProps } from './notices/notices';
import PatternAssemblerContainer from './pattern-assembler-container';
import PatternLargePreview from './pattern-large-preview';
import ScreenActivation from './screen-activation';
import ScreenCategoryList from './screen-category-list';
import ScreenColorPalettes from './screen-color-palettes';
import ScreenFontPairings from './screen-font-pairings';
import ScreenFooter from './screen-footer';
import ScreenHeader from './screen-header';
import ScreenMain from './screen-main';
import { encodePatternId } from './utils';
import withGlobalStylesProvider from './with-global-styles-provider';
import type { Pattern } from './types';
import type { StepProps } from '../../types';
import type { OnboardSelect } from '@automattic/data-stores';
import type { DesignRecipe, Design } from '@automattic/design-picker/src/types';
import type { GlobalStylesObject } from '@automattic/global-styles';
import type { FC } from 'react';
import type { AnyAction } from 'redux';
import type { ThunkAction } from 'redux-thunk';
import './style.scss';

const PatternAssembler = ( {
	navigation,
	flow,
	stepName,
	noticeOperations,
	noticeUI,
}: StepProps & NoticesProps ) => {
	const translate = useTranslate();
	const navigator = useNavigator();
	const [ sectionPosition, setSectionPosition ] = useState< number | null >( null );
	const wrapperRef = useRef< HTMLDivElement | null >( null );
	const [ activePosition, setActivePosition ] = useState( -1 );
	const [ surveyDismissed, setSurveyDismissed ] = useState( false );
	const [ isPatternPanelListOpen, setIsPatternPanelListOpen ] = useState( false );
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
	// New sites are created from 'site-setup' and 'with-site-assembler' flows
	const isNewSite = !! useQuery().get( 'isNewSite' ) || isSiteSetupFlow( flow );

	// The categories api triggers the ETK plugin before the PTK api request
	const categories = usePatternCategories( site?.ID );
	// Fetching all patterns and categories from PTK api
	const dotcomPatterns = useDotcomPatterns( locale );
	const allPatterns = useCategoryAll( dotcomPatterns );
	const patternIds = useMemo(
		() => allPatterns.map( ( pattern ) => encodePatternId( pattern.ID ) ),
		[ allPatterns ]
	);
	const patternsMapByCategory = usePatternsMapByCategory( allPatterns, categories );
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
		generateKey,
		snapshotRecipe,
	} = useRecipe( site?.ID, allPatterns, categories );

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
			} ),
		[ flow, stepName, intent, stylesheet, colorVariation, fontVariation ]
	);

	const selectedVariations = useMemo(
		() => [ colorVariation, fontVariation ].filter( Boolean ) as GlobalStylesObject[],
		[ colorVariation, fontVariation ]
	);

	const syncedGlobalStylesUserConfig = useSyncGlobalStylesUserConfig( selectedVariations );

	usePrefetchImages();

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

	const trackEventContinue = () => {
		const patterns = getPatterns();
		const categories = Array.from( new Set( patterns.map( ( { category } ) => category?.name ) ) );

		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.CONTINUE_CLICK, {
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

	const getDesign = () =>
		( {
			...selectedDesign,
			recipe: {
				...selectedDesign?.recipe,
				header_pattern_ids: header ? [ encodePatternId( header.ID ) ] : undefined,
				pattern_ids: sections.filter( Boolean ).map( ( pattern ) => encodePatternId( pattern.ID ) ),
				footer_pattern_ids: footer ? [ encodePatternId( footer.ID ) ] : undefined,
			} as DesignRecipe,
		} as Design );

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

	const replaceSection = ( pattern: Pattern ) => {
		if ( sectionPosition !== null ) {
			setSections( [
				...sections.slice( 0, sectionPosition ),
				{
					...pattern,
					key: sections[ sectionPosition ].key,
				},
				...sections.slice( sectionPosition + 1 ),
			] );
			updateActivePatternPosition( sectionPosition );
			noticeOperations.showPatternInsertedNotice( pattern );
		}
	};

	const addSection = ( pattern: Pattern ) => {
		setSections( [
			...( sections as Pattern[] ),
			{
				...pattern,
				key: generateKey( pattern ),
			},
		] );
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
		type: string,
		selectedPattern: Pattern | null,
		selectedCategory?: string | null
	) => {
		if ( selectedPattern ) {
			// Inject the selected pattern category or the first category
			// to be used in tracks and as selected pattern name.
			const [ firstCategory ] = Object.keys( selectedPattern.categories );
			selectedPattern.category = categories.find( ( { name } ) => {
				if ( selectedCategory === CATEGORY_ALL_SLUG ) {
					return name === firstCategory;
				}
				return name === ( selectedCategory || firstCategory );
			} );

			if ( selectedCategory === CATEGORY_ALL_SLUG ) {
				// Use 'all' rather than 'featured' as slug for tracks.
				// Use the first category label as selected pattern name.
				selectedPattern.category = {
					name: 'all',
					label: selectedPattern.category?.label,
				};
			}

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

	const onBack = () => {
		if ( navigator.location.path === NAVIGATOR_PATHS.ACTIVATION ) {
			navigator.goBack();
			return;
		}

		const patterns = getPatterns();
		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.BACK_CLICK, {
			has_selected_patterns: patterns.length > 0,
			pattern_count: patterns.length,
		} );

		goBack?.();
	};

	const onSubmit = () => {
		const design = getDesign();
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
		submit?.();
	};

	const handleContinue = () => {
		if ( isNewSite ) {
			onSubmit();
		} else {
			navigator.goTo( NAVIGATOR_PATHS.ACTIVATION );
		}
	};

	const {
		shouldUnlockGlobalStyles,
		openModal: openGlobalStylesUpgradeModal,
		globalStylesUpgradeModalProps,
	} = useGlobalStylesUpgradeModal( {
		flowName: flow,
		stepName,
		hasSelectedColorVariation: !! colorVariation,
		hasSelectedFontVariation: !! fontVariation,
		onCheckout: snapshotRecipe,
		onUpgradeLater: handleContinue,
		recordTracksEvent,
	} );

	const onPatternSelectorBack = ( type: string ) => {
		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.PATTERN_SELECT_BACK_CLICK, {
			pattern_type: type,
		} );
	};

	const onDoneClick = ( type: string ) => {
		const patterns = getPatterns( type );
		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.PATTERN_SELECT_DONE_CLICK, {
			pattern_type: type,
			pattern_ids: patterns.map( ( { ID } ) => ID ).join( ',' ),
			pattern_names: patterns.map( ( { name } ) => name ).join( ',' ),
			pattern_categories: patterns.map( ( { category } ) => category?.name ).join( ',' ),
		} );
	};

	const onContinueClick = () => {
		trackEventContinue();

		if ( shouldUnlockGlobalStyles ) {
			openGlobalStylesUpgradeModal();
			return;
		}

		handleContinue();
	};

	const onActivate = () => {
		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.SCREEN_ACTIVATION_ACTIVATE_CLICK );
		onSubmit();
	};

	const onMainItemSelect = ( name: string ) => {
		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.MAIN_ITEM_SELECT, { name } );
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

	const onScreenColorsSelect = ( variation: GlobalStylesObject | null ) => {
		setColorVariation( variation );
		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.SCREEN_COLORS_PREVIEW_CLICK, {
			color_variation_title: getVariationTitle( variation ),
			color_variation_type: getVariationType( variation ),
		} );
	};

	const onScreenColorsBack = () => {
		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.SCREEN_COLORS_BACK_CLICK );
	};

	const onScreenColorsDone = () => {
		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.SCREEN_COLORS_DONE_CLICK );
	};

	const onScreenFontsSelect = ( variation: GlobalStylesObject | null ) => {
		setFontVariation( variation );
		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.SCREEN_FONTS_PREVIEW_CLICK, {
			font_variation_title: getVariationTitle( variation ),
			font_variation_type: getVariationType( variation ),
		} );
	};

	const onScreenFontsBack = () => {
		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.SCREEN_FONTS_BACK_CLICK );
	};

	const onScreenFontsDone = () => {
		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.SCREEN_FONTS_DONE_CLICK );
	};

	if ( ! site?.ID || ! selectedDesign ) {
		return null;
	}

	const stepContent = (
		<div
			className={ classnames( 'pattern-assembler__wrapper', {
				'pattern-assembler__pattern-panel-list--is-open': isPatternPanelListOpen,
			} ) }
			ref={ wrapperRef }
			tabIndex={ -1 }
		>
			{ noticeUI }
			<div className="pattern-assembler__sidebar">
				<NavigatorScreen path={ NAVIGATOR_PATHS.MAIN }>
					<ScreenMain
						onSelect={ onMainItemSelect }
						onContinueClick={ onContinueClick }
						recordTracksEvent={ recordTracksEvent }
						surveyDismissed={ surveyDismissed }
						setSurveyDismissed={ setSurveyDismissed }
						hasSections={ Boolean( sections.length ) }
						hasHeader={ Boolean( header ) }
						hasFooter={ Boolean( footer ) }
						hasColor={ Boolean( colorVariation ) }
						hasFont={ Boolean( fontVariation ) }
					/>
				</NavigatorScreen>

				<NavigatorScreen path={ NAVIGATOR_PATHS.HEADER }>
					<ScreenHeader
						selectedPattern={ header }
						onSelect={ onSelect }
						onBack={ () => onPatternSelectorBack( 'header' ) }
						onDoneClick={ () => onDoneClick( 'header' ) }
						updateActivePatternPosition={ () => updateActivePatternPosition( -1 ) }
						patterns={ patternsMapByCategory[ 'header' ] || [] }
					/>
				</NavigatorScreen>

				<NavigatorScreen path={ NAVIGATOR_PATHS.FOOTER }>
					<ScreenFooter
						selectedPattern={ footer }
						onSelect={ onSelect }
						onBack={ () => onPatternSelectorBack( 'footer' ) }
						onDoneClick={ () => onDoneClick( 'footer' ) }
						updateActivePatternPosition={ () => activateFooterPosition( !! footer ) }
						patterns={ patternsMapByCategory[ 'footer' ] || [] }
					/>
				</NavigatorScreen>

				<NavigatorScreen path={ NAVIGATOR_PATHS.SECTION_PATTERNS }>
					<ScreenCategoryList
						categories={ categories }
						patternsMapByCategory={ patternsMapByCategory }
						onDoneClick={ () => onDoneClick( 'section' ) }
						replacePatternMode={ sectionPosition !== null }
						selectedPattern={ sectionPosition !== null ? sections[ sectionPosition ] : null }
						onSelect={ onSelect }
						recordTracksEvent={ recordTracksEvent }
						onTogglePatternPanelList={ setIsPatternPanelListOpen }
						selectedPatterns={ sections }
						onBack={ () => onPatternSelectorBack( 'section' ) }
					/>
				</NavigatorScreen>

				<NavigatorScreen path={ NAVIGATOR_PATHS.COLOR_PALETTES }>
					<ScreenColorPalettes
						siteId={ site?.ID }
						stylesheet={ stylesheet }
						selectedColorPaletteVariation={ colorVariation }
						onSelect={ onScreenColorsSelect }
						onBack={ onScreenColorsBack }
						onDoneClick={ onScreenColorsDone }
					/>
				</NavigatorScreen>

				<NavigatorScreen path={ NAVIGATOR_PATHS.FONT_PAIRINGS }>
					<ScreenFontPairings
						siteId={ site?.ID }
						stylesheet={ stylesheet }
						selectedFontPairingVariation={ fontVariation }
						onSelect={ onScreenFontsSelect }
						onBack={ onScreenFontsBack }
						onDoneClick={ onScreenFontsDone }
					/>
				</NavigatorScreen>

				<NavigatorScreen path={ NAVIGATOR_PATHS.ACTIVATION } className="screen-activation">
					<ScreenActivation onActivate={ onActivate } />
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
				recordTracksEvent={ recordTracksEvent }
			/>
			<PremiumGlobalStylesUpgradeModal { ...globalStylesUpgradeModalProps } />
		</div>
	);

	return (
		<StepContainer
			className="pattern-assembler__sidebar-revamp"
			stepName="pattern-assembler"
			hideBack={
				navigator.location.path !== NAVIGATOR_PATHS.ACTIVATION &&
				navigator.location.path !== NAVIGATOR_PATHS.MAIN
			}
			backLabelText={
				isSiteAssemblerFlow( flow ) && navigator.location.path === NAVIGATOR_PATHS.MAIN
					? translate( 'Back to themes' )
					: undefined
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

const PatternAssemblerStep = ( props: StepProps & NoticesProps ) => (
	<NavigatorProvider initialPath={ NAVIGATOR_PATHS.MAIN } tabIndex={ -1 }>
		<PatternAssembler { ...props } />
	</NavigatorProvider>
);

export default compose(
	withGlobalStylesProvider,
	withNotices
)( PatternAssemblerStep ) as FC< StepProps >;
