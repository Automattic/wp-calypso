import { isEnabled } from '@automattic/calypso-config';
import { useSyncGlobalStylesUserConfig } from '@automattic/global-styles';
import { StepContainer, WITH_THEME_ASSEMBLER_FLOW } from '@automattic/onboarding';
import {
	__experimentalNavigatorProvider as NavigatorProvider,
	__experimentalNavigatorScreen as NavigatorScreen,
	SnackbarList,
} from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { useState, useRef, useMemo } from 'react';
import { useDispatch as useReduxDispatch } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { requestActiveTheme } from 'calypso/state/themes/actions';
import { useSite } from '../../../../hooks/use-site';
import { useSiteIdParam } from '../../../../hooks/use-site-id-param';
import { useSiteSlugParam } from '../../../../hooks/use-site-slug-param';
import { SITE_STORE, ONBOARD_STORE } from '../../../../stores';
import { recordSelectedDesign } from '../../analytics/record-design';
import { SITE_TAGLINE, PLACEHOLDER_SITE_ID } from './constants';
import usePatternCategoriesFromAPI from './hooks/use-pattern-categories-from-api';
import useSectionsMapByCategory from './hooks/use-sections-map-by-category';
import NavigatorListener from './navigator-listener';
import PatternList from './pattern-list';
import { useAllPatterns, useSectionPatterns } from './patterns-data';
import ScreenCategoryList from './screen-category-list';
import ScreenFooter from './screen-footer';
import ScreenHeader from './screen-header';
import ScreenHomepage from './screen-homepage';
import ScreenMain from './screen-main';
import { encodePatternId, createCustomHomeTemplateContent } from './utils';
import withGlobalStylesProvider from './with-global-styles-provider';
import type { Pattern, Category, Notice } from './types';
import type { Step } from '../../types';
import type { DesignRecipe, Design } from '@automattic/design-picker/src/types';
import type { GlobalStylesObject } from '@automattic/global-styles';
import './style.scss';

const PatternAssembler: Step = ( { navigation, flow, stepName } ) => {
	const translate = useTranslate();
	const [ navigatorPath, setNavigatorPath ] = useState( '/' );
	const [ header, setHeader ] = useState< Pattern | null >( null );
	const [ footer, setFooter ] = useState< Pattern | null >( null );
	const [ sections, setSections ] = useState< Pattern[] >( [] );
	const [ sectionPosition, setSectionPosition ] = useState< number | null >( null );
	const [ categorySelected, setCategory ] = useState< string | null >( null );
	const [ openPatternList, setOpenPatternList ] = useState< boolean | null >( null );
	const [ notices, setNotices ] = useState< Notice[] >( [] );

	const wrapperRef = useRef< HTMLDivElement | null >( null );
	const incrementIndexRef = useRef( 0 );
	const [ activePosition, setActivePosition ] = useState( -1 );
	const { goBack, goNext, submit } = navigation;
	const { setThemeOnSite, runThemeSetupOnSite, createCustomTemplate, setGlobalStyles } =
		useDispatch( SITE_STORE );
	const reduxDispatch = useReduxDispatch();
	const { setPendingAction } = useDispatch( ONBOARD_STORE );
	const selectedDesign = useSelect( ( select ) => select( ONBOARD_STORE ).getSelectedDesign() );
	const intent = useSelect( ( select ) => select( ONBOARD_STORE ).getIntent() );
	const site = useSite();
	const siteSlug = useSiteSlugParam();
	const siteId = useSiteIdParam();
	const siteSlugOrId = siteSlug ? siteSlug : siteId;
	const allPatterns = useAllPatterns();
	const sectionPatterns = useSectionPatterns();
	const categoriesQuery = usePatternCategoriesFromAPI( site?.ID );
	const categories = ( categoriesQuery?.data || [] ) as Category[];
	const sectionsMapByCategory = useSectionsMapByCategory( sectionPatterns, categories );
	const commonEventProps = {
		flow,
		step: stepName,
		intent,
	};
	const isEnabledColorAndFonts = isEnabled( 'pattern-assembler/color-and-fonts' );

	const [ selectedColorPaletteVariation, setSelectedColorPaletteVariation ] =
		useState< GlobalStylesObject | null >( null );
	const [ selectedFontPairingVariation, setSelectedFontPairingVariation ] =
		useState< GlobalStylesObject | null >( null );

	const selectedVariations = useMemo(
		() =>
			[ selectedColorPaletteVariation, selectedFontPairingVariation ].filter(
				Boolean
			) as GlobalStylesObject[],
		[ selectedColorPaletteVariation, selectedFontPairingVariation ]
	);

	const syncedGlobalStylesUserConfig = useSyncGlobalStylesUserConfig(
		selectedVariations,
		isEnabledColorAndFonts
	);

	const siteInfo = {
		title: site?.name,
		tagline: site?.description || SITE_TAGLINE,
	};

	// Functions

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
			...commonEventProps,
			pattern_type: patternType,
		} );
	};

	const trackEventPatternSelect = ( {
		patternType,
		patternId,
		patternName,
	}: {
		patternType: string | undefined;
		patternId: number;
		patternName: string;
	} ) => {
		recordTracksEvent( 'calypso_signup_pattern_assembler_pattern_select_click', {
			...commonEventProps,
			pattern_type: patternType,
			pattern_id: patternId,
			pattern_name: patternName,
		} );
	};

	const trackEventContinue = () => {
		const patterns = getPatterns();
		recordTracksEvent( 'calypso_signup_pattern_assembler_continue_click', {
			...commonEventProps,
			pattern_types: [ header && 'header', sections.length && 'section', footer && 'footer' ]
				.filter( Boolean )
				.join( ',' ),
			pattern_ids: patterns.map( ( { id } ) => id ).join( ',' ),
			pattern_names: patterns.map( ( { name } ) => name ).join( ',' ),
			pattern_count: patterns.length,
		} );
		patterns.forEach( ( { id, name, category } ) => {
			recordTracksEvent( 'calypso_signup_pattern_assembler_pattern_final_select', {
				...commonEventProps,
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

	// @TODO: handle the state in a new component <Notices>
	const hideNotices = () => setNotices( [] );
	const showNotice = ( label: string, patternSelected: Pattern ) => {
		const id = patternSelected.key;
		const labels: { [ key: string ]: any } = {
			add: translate( 'Pattern "%(patternName)s" added.', {
				args: { patternName: patternSelected.category?.label },
			} ),
			replace: translate( 'Pattern "%(patternName)s" replaced.', {
				args: { patternName: patternSelected.name },
			} ),
			remove: translate( 'Pattern "%(patternName)s" removed.', {
				args: { patternName: patternSelected.name },
			} ),
		};

		if ( ! id ) {
			return;
		}

		setNotices( [
			...notices,
			{
				id,
				content: labels[ label ],
			},
		] );
	};

	const onRemoveNotice = ( id: string ) => {
		setNotices( notices.filter( ( notice ) => notice.id !== id ) );
	};

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

	const replaceSection = ( patternSelected: Pattern ) => {
		if ( sectionPosition !== null ) {
			const pattern = {
				...patternSelected,
				key: sections[ sectionPosition ].key,
			};
			setSections( [
				...sections.slice( 0, sectionPosition ),
				pattern,
				...sections.slice( sectionPosition + 1 ),
			] );
			updateActivePatternPosition( sectionPosition );
		}
	};

	const addSection = ( patternSelected: Pattern ) => {
		incrementIndexRef.current++;
		const key = `${ incrementIndexRef.current }-${ patternSelected.id }`;
		const pattern = {
			...patternSelected,
			key,
		};
		setSections( [ ...( sections as Pattern[] ), pattern ] );
		updateActivePatternPosition( sections.length );
		showNotice( 'add', pattern );
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

	const onSelect = ( type: string, selectedPattern: Pattern | null ) => {
		if ( selectedPattern ) {
			// Getselected pattern category or the first
			selectedPattern.category = categories.find(
				( { name } ) => name === ( categorySelected || selectedPattern.categories[ 0 ] )
			);

			trackEventPatternSelect( {
				patternType: selectedPattern.category?.name,
				patternId: selectedPattern.id,
				patternName: selectedPattern.name,
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
		recordTracksEvent( 'calypso_signup_pattern_assembler_back_click', {
			...commonEventProps,
			has_selected_patterns: patterns.length > 0,
			pattern_count: patterns.length,
		} );

		goBack?.();
	};

	const onSubmit = () => {
		if ( ! siteSlugOrId ) {
			return;
		}

		const design = getDesign();
		const stylesheet = design.recipe!.stylesheet!;
		const theme = stylesheet?.split( '/' )[ 1 ] || design.theme;

		setPendingAction( () =>
			// We have to switch theme first. Otherwise, the unique suffix might append to
			// the slug of newly created Home template if the current activated theme has
			// modified Home template.
			setThemeOnSite( siteSlugOrId, theme, undefined, false )
				.then( () => {
					if ( isEnabledColorAndFonts ) {
						return setGlobalStyles( siteSlugOrId, stylesheet, syncedGlobalStylesUserConfig );
					}
				} )
				.then( () =>
					createCustomTemplate(
						siteSlugOrId,
						stylesheet,
						'home',
						translate( 'Home' ),
						createCustomHomeTemplateContent( stylesheet, !! header, !! footer, !! sections.length )
					)
				)
				.then( () =>
					runThemeSetupOnSite( siteSlugOrId, design, {
						trimContent: false,
						posts_source_site_id: PLACEHOLDER_SITE_ID,
					} )
				)
				.then( () => reduxDispatch( requestActiveTheme( site?.ID || -1 ) ) )
		);

		recordSelectedDesign( { flow, intent, design } );
		submit?.();
	};

	const onDoneClick = ( type: string ) => {
		const patterns = getPatterns( type );
		hideNotices();
		recordTracksEvent( 'calypso_signup_pattern_assembler_pattern_select_done_click', {
			...commonEventProps,
			pattern_type: type,
			pattern_ids: patterns.map( ( { id } ) => id ).join( ',' ),
			pattern_names: patterns.map( ( { name } ) => name ).join( ',' ),
		} );
	};

	const onContinueClick = () => {
		trackEventContinue();
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

		recordTracksEvent( 'calypso_signup_pattern_assembler_main_item_select', {
			...commonEventProps,
			name,
		} );
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
	};

	const onMoveUpSection = ( position: number ) => {
		moveUpSection( position );
	};

	const onMoveDownSection = ( position: number ) => {
		moveDownSection( position );
	};

	const handleClosePatternList = ( event: React.MouseEvent ) => {
		// Click on large preview to close Pattern List
		if ( ( event.target as HTMLElement ).closest( '.pattern-large-preview' ) ) {
			setOpenPatternList( null );
			setCategory( null );
		}
	};

	const stepContent = (
		// eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
		<div
			onClick={ handleClosePatternList }
			className="pattern-assembler__wrapper"
			ref={ wrapperRef }
			tabIndex={ -1 }
		>
			{ isEnabled( 'pattern-assembler/categories' ) && (
				<SnackbarList notices={ notices } onRemove={ onRemoveNotice } />
			) }
			<NavigatorProvider className="pattern-assembler__sidebar" initialPath="/">
				<NavigatorScreen path="/">
					<ScreenMain onSelect={ onMainItemSelect } onContinueClick={ onContinueClick } />
				</NavigatorScreen>

				<NavigatorScreen path="/header">
					<ScreenHeader
						selectedPattern={ header }
						onSelect={ ( selectedPattern ) => onSelect( 'header', selectedPattern ) }
						onDoneClick={ () => onDoneClick( 'header' ) }
					/>
				</NavigatorScreen>

				<NavigatorScreen path="/footer">
					<ScreenFooter
						selectedPattern={ footer }
						onSelect={ ( selectedPattern ) => onSelect( 'footer', selectedPattern ) }
						onDoneClick={ () => onDoneClick( 'footer' ) }
					/>
				</NavigatorScreen>

				<NavigatorScreen path="/homepage">
					<ScreenHomepage
						patterns={ sections }
						onDoneClick={ () => onDoneClick( 'section' ) }
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
							setOpenPatternList={ setOpenPatternList }
							setCategory={ setCategory }
							categorySelected={ categorySelected }
							replacePatternMode={ sectionPosition !== null }
						/>
					) : (
						<PatternList
							onSelect={ ( selectedPattern ) => onSelect( 'section', selectedPattern ) }
							selectedPattern={ sectionPosition !== null ? sections[ sectionPosition ] : null }
							patterns={ sectionPatterns }
							openPatternList={ openPatternList }
							categorySelected={ categorySelected }
							categories={ categories }
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
							stylesheet={ selectedDesign?.recipe?.stylesheet }
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
							stylesheet={ selectedDesign?.recipe?.stylesheet }
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
			<AsyncLoad
				require="./pattern-large-preview"
				{ ...{
					placeholder: null,
					header,
					sections,
					footer,
					activePosition,
				} }
			/>
			{ isEnabled( 'pattern-assembler/categories' ) && (
				<AsyncLoad
					require="./pattern-list"
					{ ...{
						onSelect: ( selectedPattern: Pattern ) => onSelect( 'section', selectedPattern ),
						selectedPattern: sectionPosition !== null ? sections[ sectionPosition ] : null,
						patterns: sectionPatterns,
						sectionPosition,
						openPatternList,
						categorySelected,
						categories,
					} }
				/>
			) }
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
				<AsyncLoad
					require="./pattern-assembler-container"
					placeholder={ null }
					siteId={ site?.ID }
					stylesheet={ selectedDesign?.recipe?.stylesheet }
					patternIds={ allPatterns.map( ( pattern ) => encodePatternId( pattern.id ) ) }
					siteInfo={ siteInfo }
				>
					{ stepContent }
				</AsyncLoad>
			}
			recordTracksEvent={ recordTracksEvent }
			stepSectionName={ navigatorPath !== '/' ? 'pattern-selector' : undefined }
		/>
	);
};

export default withGlobalStylesProvider( PatternAssembler );
