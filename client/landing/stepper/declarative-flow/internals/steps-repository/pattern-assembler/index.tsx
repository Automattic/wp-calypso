import { isEnabled } from '@automattic/calypso-config';
import { useSyncGlobalStylesUserConfig } from '@automattic/global-styles';
import { StepContainer, WITH_THEME_ASSEMBLER_FLOW } from '@automattic/onboarding';
import {
	__experimentalNavigatorProvider as NavigatorProvider,
	__experimentalNavigatorScreen as NavigatorScreen,
} from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useState, useRef, useMemo } from 'react';
import { useDispatch as useReduxDispatch } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import PremiumGlobalStylesUpgradeModal from 'calypso/components/premium-global-styles-upgrade-modal';
import { ActiveTheme } from 'calypso/data/themes/use-active-theme-query';
import { createRecordTracksEvent } from 'calypso/lib/analytics/tracks';
import { usePremiumGlobalStyles } from 'calypso/state/sites/hooks/use-premium-global-styles';
import { setActiveTheme } from 'calypso/state/themes/actions';
import { useSite } from '../../../../hooks/use-site';
import { useSiteIdParam } from '../../../../hooks/use-site-id-param';
import { useSiteSlugParam } from '../../../../hooks/use-site-slug-param';
import { SITE_STORE, ONBOARD_STORE } from '../../../../stores';
import { recordSelectedDesign } from '../../analytics/record-design';
import { SITE_TAGLINE, PLACEHOLDER_SITE_ID } from './constants';
import useGlobalStylesUpgradeModal from './hooks/use-global-styles-upgrade-modal';
import usePatternCategories from './hooks/use-pattern-categories';
import usePatternsMapByCategory from './hooks/use-patterns-map-by-category';
import NavigatorListener from './navigator-listener';
import PatternAssemblerContainer from './pattern-assembler-container';
import PatternLargePreview from './pattern-large-preview';
import { useAllPatterns, useSectionPatterns } from './patterns-data';
import ScreenCategoryList from './screen-category-list';
import ScreenFooter from './screen-footer';
import ScreenHeader from './screen-header';
import ScreenHomepage from './screen-homepage';
import ScreenMain from './screen-main';
import ScreenPatternList from './screen-pattern-list';
import { encodePatternId } from './utils';
import withGlobalStylesProvider from './with-global-styles-provider';
import type { Pattern, Category } from './types';
import type { Step } from '../../types';
import type { OnboardSelect } from '@automattic/data-stores';
import type { DesignRecipe, Design } from '@automattic/design-picker/src/types';
import type { GlobalStylesObject } from '@automattic/global-styles';
import './style.scss';

const PatternAssembler: Step = ( { navigation, flow, stepName } ) => {
	const [ navigatorPath, setNavigatorPath ] = useState( '/' );
	const [ header, setHeader ] = useState< Pattern | null >( null );
	const [ footer, setFooter ] = useState< Pattern | null >( null );
	const [ sections, setSections ] = useState< Pattern[] >( [] );
	const [ sectionPosition, setSectionPosition ] = useState< number | null >( null );
	const wrapperRef = useRef< HTMLDivElement | null >( null );
	const incrementIndexRef = useRef( 0 );
	const [ activePosition, setActivePosition ] = useState( -1 );
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

	const stylesheet = selectedDesign?.recipe?.stylesheet || '';

	const isEnabledColorAndFonts = isEnabled( 'pattern-assembler/color-and-fonts' );

	const [ selectedColorPaletteVariation, setSelectedColorPaletteVariation ] =
		useState< GlobalStylesObject | null >( null );
	const [ selectedFontPairingVariation, setSelectedFontPairingVariation ] =
		useState< GlobalStylesObject | null >( null );

	const recordTracksEvent = useMemo(
		() =>
			createRecordTracksEvent( {
				flow,
				step: stepName,
				intent,
				stylesheet,
				color_style_title: selectedColorPaletteVariation?.title,
				font_style_title: selectedFontPairingVariation?.title,
			} ),
		[
			flow,
			stepName,
			intent,
			stylesheet,
			selectedColorPaletteVariation,
			selectedFontPairingVariation,
		]
	);

	const selectedVariations = useMemo(
		() =>
			[ selectedColorPaletteVariation, selectedFontPairingVariation ].filter(
				Boolean
			) as GlobalStylesObject[],
		[ selectedColorPaletteVariation, selectedFontPairingVariation ]
	);

	const { shouldLimitGlobalStyles } = usePremiumGlobalStyles();
	const shouldUnlockGlobalStyles = shouldLimitGlobalStyles && selectedVariations.length > 0;

	const syncedGlobalStylesUserConfig = useSyncGlobalStylesUserConfig(
		selectedVariations,
		isEnabledColorAndFonts
	);

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
		recordTracksEvent( 'calypso_signup_pattern_assembler_pattern_add_click', {
			pattern_type: patternType,
		} );
	};

	const trackEventPatternSelect = ( {
		patternType,
		patternId,
		patternName,
	}: {
		patternType: string;
		patternId: number;
		patternName: string;
	} ) => {
		recordTracksEvent( 'calypso_signup_pattern_assembler_pattern_select_click', {
			pattern_type: patternType,
			pattern_id: patternId,
			pattern_name: patternName,
		} );
	};

	const trackEventContinue = () => {
		const patterns = getPatterns();
		recordTracksEvent( 'calypso_signup_pattern_assembler_continue_click', {
			pattern_types: [ header && 'header', sections.length && 'section', footer && 'footer' ]
				.filter( Boolean )
				.join( ',' ),
			pattern_ids: patterns.map( ( { id } ) => id ).join( ',' ),
			pattern_names: patterns.map( ( { name } ) => name ).join( ',' ),
			pattern_count: patterns.length,
		} );
		patterns.forEach( ( { id, name, category } ) => {
			recordTracksEvent( 'calypso_signup_pattern_assembler_pattern_final_select', {
				pattern_id: id,
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
	};

	const updateFooter = ( pattern: Pattern | null ) => {
		setFooter( pattern );
		updateActivePatternPosition( sections.length );
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
		}
	};

	const addSection = ( pattern: Pattern ) => {
		incrementIndexRef.current++;
		setSections( [
			...( sections as Pattern[] ),
			{
				...pattern,
				key: `${ incrementIndexRef.current }-${ pattern.id }`,
			},
		] );
		updateActivePatternPosition( sections.length );
	};

	const deleteSection = ( position: number ) => {
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
		categorySelected: string | null
	) => {
		if ( selectedPattern ) {
			// Inject the selected pattern category or the first category
			// because it's used in tracks and as pattern name in the list
			selectedPattern.category = categories.find( ( { name } ) => name === categorySelected );

			if ( selectedPattern.category ) {
				trackEventPatternSelect( {
					patternType: selectedPattern.category.name,
					patternId: selectedPattern.id,
					patternName: selectedPattern.name,
				} );
			}
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
		recordTracksEvent( 'calypso_signup_pattern_assembler_back_click', {
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

	const { openModal: openGlobalStylesUpgradeModal, ...globalStylesUpgradeModalProps } =
		useGlobalStylesUpgradeModal( {
			onSubmit,
			recordTracksEvent,
		} );

	const onPatternSelectorBack = ( type: string ) => {
		recordTracksEvent( 'calypso_signup_pattern_assembler_pattern_select_back_click', {
			pattern_type: type,
		} );
	};

	const onDoneClick = ( type: string ) => {
		const patterns = getPatterns( type );
		recordTracksEvent( 'calypso_signup_pattern_assembler_pattern_select_done_click', {
			pattern_type: type,
			pattern_ids: patterns.map( ( { id } ) => id ).join( ',' ),
			pattern_names: patterns.map( ( { name } ) => name ).join( ',' ),
		} );
	};

	const onContinueClick = () => {
		trackEventContinue();

		if ( shouldLimitGlobalStyles && selectedVariations.length > 0 ) {
			openGlobalStylesUpgradeModal();
			return;
		}

		onSubmit();
	};

	const onMainItemSelect = ( name: string ) => {
		if ( name === 'header' ) {
			trackEventPatternAdd( 'header' );
		} else if ( name === 'footer' ) {
			trackEventPatternAdd( 'footer' );
		} else if ( name === 'homepage' ) {
			trackEventPatternAdd( 'section' );
		}

		recordTracksEvent( 'calypso_signup_pattern_assembler_main_item_select', { name } );
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

	const stepContent = (
		<div className="pattern-assembler__wrapper" ref={ wrapperRef } tabIndex={ -1 }>
			<NavigatorProvider className="pattern-assembler__sidebar" initialPath="/">
				<NavigatorScreen path="/">
					<ScreenMain
						shouldUnlockGlobalStyles={ shouldUnlockGlobalStyles }
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

				<NavigatorScreen path="/homepage">
					<ScreenHomepage
						patterns={ sections }
						onAddSection={ onAddSection }
						onReplaceSection={ onReplaceSection }
						onDeleteSection={ onDeleteSection }
						onMoveUpSection={ onMoveUpSection }
						onMoveDownSection={ onMoveDownSection }
					/>
				</NavigatorScreen>
				<NavigatorScreen path="/homepage/patterns">
					{ isEnabled( 'pattern-assembler/categories' ) ? (
						<ScreenCategoryList
							categories={ categories }
							sectionsMapByCategory={ sectionsMapByCategory }
							onDoneClick={ () => onDoneClick( 'section' ) }
							replacePatternMode={ sectionPosition !== null }
							selectedPattern={ sectionPosition !== null ? sections[ sectionPosition ] : null }
							onSelect={ onSelect }
							wrapperRef={ wrapperRef }
						/>
					) : (
						<ScreenPatternList
							selectedPattern={ sectionPosition !== null ? sections[ sectionPosition ] : null }
							onSelect={ ( selectedPattern ) => onSelect( 'section', selectedPattern, 'section' ) }
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
							selectedColorPaletteVariation={ selectedColorPaletteVariation }
							onSelect={ setSelectedColorPaletteVariation }
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
							selectedFontPairingVariation={ selectedFontPairingVariation }
							onSelect={ setSelectedFontPairingVariation }
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

export default withGlobalStylesProvider( PatternAssembler );
