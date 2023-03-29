import { isEnabled } from '@automattic/calypso-config';
import { useSyncGlobalStylesUserConfig } from '@automattic/global-styles';
import { StepContainer, WITH_THEME_ASSEMBLER_FLOW } from '@automattic/onboarding';
import {
	__experimentalNavigatorProvider as NavigatorProvider,
	__experimentalNavigatorScreen as NavigatorScreen,
	withNotices,
} from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import classnames from 'classnames';
import { useState, useRef, useMemo } from 'react';
import { useDispatch as useReduxDispatch } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import PremiumGlobalStylesUpgradeModal from 'calypso/components/premium-global-styles-upgrade-modal';
import { ActiveTheme } from 'calypso/data/themes/use-active-theme-query';
import { createRecordTracksEvent } from 'calypso/lib/analytics/tracks';
import { setActiveTheme } from 'calypso/state/themes/actions';
import { useSite } from '../../../../hooks/use-site';
import { useSiteIdParam } from '../../../../hooks/use-site-id-param';
import { useSiteSlugParam } from '../../../../hooks/use-site-slug-param';
import { SITE_STORE, ONBOARD_STORE } from '../../../../stores';
import { recordSelectedDesign } from '../../analytics/record-design';
import { SITE_TAGLINE, PLACEHOLDER_SITE_ID, PATTERN_TYPES } from './constants';
import { PATTERN_ASSEMBLER_EVENTS } from './events';
import useGlobalStylesUpgradeModal from './hooks/use-global-styles-upgrade-modal';
import usePatternCategories from './hooks/use-pattern-categories';
import usePatternsMapByCategory from './hooks/use-patterns-map-by-category';
import { usePrefetchImages } from './hooks/use-prefetch-images';
import useRecipe from './hooks/use-recipe';
import NavigatorListener from './navigator-listener';
import Notices, { getNoticeContent } from './notices/notices';
import PatternAssemblerContainer from './pattern-assembler-container';
import PatternLargePreview from './pattern-large-preview';
import { useAllPatterns, useSectionPatterns } from './patterns-data';
import ScreenCategoryList from './screen-category-list';
import ScreenFooter from './screen-footer';
import ScreenHeader from './screen-header';
import ScreenMain from './screen-main';
import ScreenPatternList from './screen-pattern-list';
import ScreenSection from './screen-section';
import { encodePatternId } from './utils';
import withGlobalStylesProvider from './with-global-styles-provider';
import type { Pattern, Category } from './types';
import type { StepProps } from '../../types';
import type { OnboardSelect } from '@automattic/data-stores';
import type { DesignRecipe, Design } from '@automattic/design-picker/src/types';
import type { GlobalStylesObject } from '@automattic/global-styles';
import './style.scss';

const PatternAssembler = ( {
	navigation,
	flow,
	stepName,
	noticeList,
	noticeOperations,
}: StepProps & withNotices.Props ) => {
	const [ navigatorPath, setNavigatorPath ] = useState( '/' );
	const [ sectionPosition, setSectionPosition ] = useState< number | null >( null );
	const wrapperRef = useRef< HTMLDivElement | null >( null );
	const [ activePosition, setActivePosition ] = useState( -1 );
	const [ isPatternPanelListOpen, setIsPatternPanelListOpen ] = useState( false );
	const { goBack, goNext, submit } = navigation;
	const { applyThemeWithPatterns } = useDispatch( SITE_STORE );
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
	const allPatterns = useAllPatterns();
	const sectionPatterns = useSectionPatterns();

	// Fetching the categories so they are ready when ScreenCategoryList loads
	const categoriesQuery = usePatternCategories( site?.ID );
	const categories = ( categoriesQuery?.data || [] ) as Category[];
	const sectionsMapByCategory = usePatternsMapByCategory( sectionPatterns, categories );
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

	const isEnabledColorAndFonts = isEnabled( 'pattern-assembler/color-and-fonts' );

	const recordTracksEvent = useMemo(
		() =>
			createRecordTracksEvent( {
				flow,
				step: stepName,
				intent,
				stylesheet,
				color_variation_title: colorVariation?.title,
				font_variation_title: fontVariation?.title,
			} ),
		[ flow, stepName, intent, stylesheet, colorVariation, fontVariation ]
	);

	const selectedVariations = useMemo(
		() => [ colorVariation, fontVariation ].filter( Boolean ) as GlobalStylesObject[],
		[ colorVariation, fontVariation ]
	);

	const syncedGlobalStylesUserConfig = useSyncGlobalStylesUserConfig(
		selectedVariations,
		isEnabledColorAndFonts
	);

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

	const trackEventPatternAdd = ( patternType: string ) => {
		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.PATTERN_ADD_CLICK, {
			pattern_type: patternType,
		} );
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
		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.CONTINUE_CLICK, {
			pattern_types: [ header && 'header', sections.length && 'section', footer && 'footer' ]
				.filter( Boolean )
				.join( ',' ),
			pattern_ids: patterns.map( ( { id } ) => id ).join( ',' ),
			pattern_names: patterns.map( ( { name } ) => name ).join( ',' ),
			pattern_categories: patterns.map( ( { category } ) => category?.name ).join( ',' ),
			pattern_count: patterns.length,
		} );
		patterns.forEach( ( { id, name, category } ) => {
			recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.PATTERN_FINAL_SELECT, {
				pattern_id: id,
				pattern_name: name,
				pattern_category: category?.name,
			} );
		} );
	};

	const showNotice = ( action: string, pattern: Pattern ) => {
		noticeOperations.createNotice( { content: getNoticeContent( action, pattern ) } );
	};

	const getDesign = () =>
		( {
			...selectedDesign,
			recipe: {
				...selectedDesign?.recipe,
				header_pattern_ids: header ? [ encodePatternId( header.id ) ] : undefined,
				pattern_ids: sections.filter( Boolean ).map( ( pattern ) => encodePatternId( pattern.id ) ),
				footer_pattern_ids: footer ? [ encodePatternId( footer.id ) ] : undefined,
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
			if ( header ) {
				showNotice( 'replace', pattern );
			} else {
				showNotice( 'add', pattern );
			}
		} else if ( header ) {
			showNotice( 'remove', header );
		}
	};

	const updateFooter = ( pattern: Pattern | null ) => {
		setFooter( pattern );
		updateActivePatternPosition( sections.length );
		if ( pattern ) {
			if ( footer ) {
				showNotice( 'replace', pattern );
			} else {
				showNotice( 'add', pattern );
			}
		} else if ( footer ) {
			showNotice( 'remove', footer );
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
			showNotice( 'replace', pattern );
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
		showNotice( 'add', pattern );
	};

	const deleteSection = ( position: number ) => {
		showNotice( 'remove', sections[ position ] );
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
			// because it's used in tracks and as pattern name in the list
			selectedPattern.category = categories.find(
				( { name } ) => name === ( selectedCategory || selectedPattern.categories[ 0 ] )
			);

			trackEventPatternSelect( {
				patternType: type,
				patternId: selectedPattern.id,
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
		const patterns = getPatterns();
		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.BACK_CLICK, {
			has_selected_patterns: patterns.length > 0,
			pattern_count: patterns.length,
		} );

		goBack?.();
	};

	const onSubmit = () => {
		const design = getDesign();

		if ( ! siteSlugOrId ) {
			return;
		}

		setPendingAction( () =>
			applyThemeWithPatterns(
				siteSlugOrId,
				design,
				syncedGlobalStylesUserConfig,
				PLACEHOLDER_SITE_ID
			).then( ( theme: ActiveTheme ) => reduxDispatch( setActiveTheme( site?.ID || -1, theme ) ) )
		);

		recordSelectedDesign( { flow, intent, design } );
		submit?.();
	};

	const {
		isDismissed: isDismissedGlobalStylesUpgradeModal,
		shouldUnlockGlobalStyles,
		openModal: openGlobalStylesUpgradeModal,
		globalStylesUpgradeModalProps,
	} = useGlobalStylesUpgradeModal( {
		hasSelectedColorVariation: !! selectedColorPaletteVariation,
		hasSelectedFontVariation: !! selectedFontPairingVariation,
		onCheckout: snapshotRecipe,
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
			pattern_ids: patterns.map( ( { id } ) => id ).join( ',' ),
			pattern_names: patterns.map( ( { name } ) => name ).join( ',' ),
			pattern_categories: patterns.map( ( { category } ) => category?.name ).join( ',' ),
		} );
	};

	const onContinueClick = () => {
		trackEventContinue();

		if ( shouldUnlockGlobalStyles && ! isDismissedGlobalStylesUpgradeModal ) {
			openGlobalStylesUpgradeModal();
			return;
		}

		onSubmit();
	};

	const onMainItemSelect = ( name: string ) => {
		if ( PATTERN_TYPES.includes( name ) ) {
			trackEventPatternAdd( name );
		}

		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.MAIN_ITEM_SELECT, { name } );
	};

	const onAddSection = () => {
		trackEventPatternAdd( 'section' );
		setSectionPosition( null );
	};

	const onReplaceSection = ( position: number ) => {
		setSectionPosition( position );
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
			title: variation?.title,
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
			title: variation?.title,
		} );
	};

	const onScreenFontsBack = () => {
		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.SCREEN_FONTS_BACK_CLICK );
	};

	const onScreenFontsDone = () => {
		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.SCREEN_FONTS_DONE_CLICK );
	};

	const stepContent = (
		<div
			className={ classnames( 'pattern-assembler__wrapper', {
				'pattern-assembler__pattern-panel-list--is-open': isPatternPanelListOpen,
			} ) }
			ref={ wrapperRef }
			tabIndex={ -1 }
		>
			{ isEnabled( 'pattern-assembler/notices' ) && (
				<Notices noticeList={ noticeList } noticeOperations={ noticeOperations } />
			) }
			<NavigatorProvider className="pattern-assembler__sidebar" initialPath="/">
				<NavigatorScreen path="/">
					<ScreenMain
						shouldUnlockGlobalStyles={ shouldUnlockGlobalStyles }
						isDismissedGlobalStylesUpgradeModal={ isDismissedGlobalStylesUpgradeModal }
						onSelect={ onMainItemSelect }
						onContinueClick={ onContinueClick }
					/>
				</NavigatorScreen>

				<NavigatorScreen path="/header">
					<ScreenHeader
						selectedPattern={ header }
						onSelect={ onSelect }
						onBack={ () => onPatternSelectorBack( 'header' ) }
						onDoneClick={ () => onDoneClick( 'header' ) }
					/>
				</NavigatorScreen>

				<NavigatorScreen path="/footer">
					<ScreenFooter
						selectedPattern={ footer }
						onSelect={ onSelect }
						onBack={ () => onPatternSelectorBack( 'footer' ) }
						onDoneClick={ () => onDoneClick( 'footer' ) }
					/>
				</NavigatorScreen>

				<NavigatorScreen path="/section">
					<ScreenSection
						patterns={ sections }
						onAddSection={ onAddSection }
						onReplaceSection={ onReplaceSection }
						onDeleteSection={ onDeleteSection }
						onMoveUpSection={ onMoveUpSection }
						onMoveDownSection={ onMoveDownSection }
					/>
				</NavigatorScreen>
				<NavigatorScreen path="/section/patterns">
					{ isEnabled( 'pattern-assembler/categories' ) ? (
						<ScreenCategoryList
							categories={ categories }
							sectionsMapByCategory={ sectionsMapByCategory }
							onDoneClick={ () => onDoneClick( 'section' ) }
							replacePatternMode={ sectionPosition !== null }
							selectedPattern={ sectionPosition !== null ? sections[ sectionPosition ] : null }
							onSelect={ onSelect }
							wrapperRef={ wrapperRef }
							onTogglePatternPanelList={ setIsPatternPanelListOpen }
							recordTracksEvent={ recordTracksEvent }
						/>
					) : (
						<ScreenPatternList
							selectedPattern={ sectionPosition !== null ? sections[ sectionPosition ] : null }
							onSelect={ ( selectedPattern ) => onSelect( 'section', selectedPattern, null ) }
							onBack={ () => onPatternSelectorBack( 'section' ) }
							onDoneClick={ () => onDoneClick( 'section' ) }
						/>
					) }
				</NavigatorScreen>

				{ isEnabledColorAndFonts && (
					<NavigatorScreen path="/color-palettes">
						<AsyncLoad
							require="./screen-color-palettes"
							placeholder={ null }
							siteId={ site?.ID }
							stylesheet={ stylesheet }
							selectedColorPaletteVariation={ colorVariation }
							onSelect={ onScreenColorsSelect }
							onBack={ onScreenColorsBack }
							onDoneClick={ onScreenColorsDone }
						/>
					</NavigatorScreen>
				) }

				{ isEnabledColorAndFonts && (
					<NavigatorScreen path="/font-pairings">
						<AsyncLoad
							require="./screen-font-pairings"
							placeholder={ null }
							siteId={ site?.ID }
							stylesheet={ stylesheet }
							selectedFontPairingVariation={ fontVariation }
							onSelect={ onScreenFontsSelect }
							onBack={ onScreenFontsBack }
							onDoneClick={ onScreenFontsDone }
						/>
					</NavigatorScreen>
				) }

				<NavigatorListener
					onLocationChange={ ( navigatorLocation ) => {
						setNavigatorPath( navigatorLocation.path );
						// Disable focus restoration from the Navigator Screen
						wrapperRef.current?.focus();
					} }
				/>
			</NavigatorProvider>
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
			/>
			<PremiumGlobalStylesUpgradeModal { ...globalStylesUpgradeModalProps } />
		</div>
	);

	if ( ! site?.ID || ! selectedDesign ) {
		return null;
	}

	return (
		<StepContainer
			className="pattern-assembler__sidebar-revamp"
			stepName="pattern-assembler"
			hideBack={ navigatorPath !== '/' || flow === WITH_THEME_ASSEMBLER_FLOW }
			goBack={ onBack }
			goNext={ goNext }
			isHorizontalLayout={ false }
			isFullLayout={ true }
			hideSkip={ true }
			stepContent={
				<PatternAssemblerContainer
					siteId={ site?.ID }
					stylesheet={ stylesheet }
					patternIds={ allPatterns.map( ( pattern ) => encodePatternId( pattern.id ) ) }
					siteInfo={ siteInfo }
				>
					{ stepContent }
				</PatternAssemblerContainer>
			}
			recordTracksEvent={ recordTracksEvent }
			stepSectionName={ navigatorPath !== '/' ? 'pattern-selector' : undefined }
		/>
	);
};

export default withGlobalStylesProvider( withNotices( PatternAssembler ) );
