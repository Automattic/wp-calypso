import { isEnabled } from '@automattic/calypso-config';
import { StepContainer, SITE_SETUP_FLOW, WITH_THEME_ASSEMBLER_FLOW } from '@automattic/onboarding';
import {
	__experimentalNavigatorProvider as NavigatorProvider,
	__experimentalNavigatorScreen as NavigatorScreen,
} from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { useState, useRef, useEffect } from 'react';
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
import NavigatorListener from './navigator-listener';
import { useAllPatterns } from './patterns-data';
import ScreenFooter from './screen-footer';
import ScreenHeader from './screen-header';
import ScreenHomepage from './screen-homepage';
import ScreenMain from './screen-main';
import ScreenPatternList from './screen-pattern-list';
import { encodePatternId, createCustomHomeTemplateContent } from './utils';
import type { Pattern } from './types';
import type { Step } from '../../types';
import type { DesignRecipe, Design } from '@automattic/design-picker/src/types';
import './style.scss';

const PatternAssembler: Step = ( { navigation, flow, stepName } ) => {
	const translate = useTranslate();
	const [ navigatorLocation, setNavigatorLocation ] = useState( '/' );
	const [ header, setHeader ] = useState< Pattern | null >( null );
	const [ footer, setFooter ] = useState< Pattern | null >( null );
	const [ sections, setSections ] = useState< Pattern[] >( [] );
	const [ sectionPosition, setSectionPosition ] = useState< number | null >( null );
	const incrementIndexRef = useRef( 0 );
	const [ activePosition, setActivePosition ] = useState( -1 );
	const { goBack, goNext, submit, goToStep } = navigation;
	const { setThemeOnSite, runThemeSetupOnSite, createCustomTemplate } = useDispatch( SITE_STORE );
	const reduxDispatch = useReduxDispatch();
	const { setPendingAction } = useDispatch( ONBOARD_STORE );
	const selectedDesign = useSelect( ( select ) => select( ONBOARD_STORE ).getSelectedDesign() );
	const intent = useSelect( ( select ) => select( ONBOARD_STORE ).getIntent() );
	const site = useSite();
	const siteSlug = useSiteSlugParam();
	const siteId = useSiteIdParam();
	const siteSlugOrId = siteSlug ? siteSlug : siteId;
	const allPatterns = useAllPatterns();
	const commonEventProps = {
		flow,
		step: stepName,
		intent,
	};

	const largePreviewProps = {
		placeholder: null,
		header,
		sections,
		footer,
		activePosition,
	};

	const siteInfo = {
		title: site?.name,
		tagline: site?.description || SITE_TAGLINE,
	};

	useEffect( () => {
		// Require to start the flow from the first step
		if ( ! selectedDesign && flow === SITE_SETUP_FLOW ) {
			goToStep?.( 'goals' );
		}
	}, [] );

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
		patternType: string;
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
		patterns.forEach( ( { id, name, category_slug } ) => {
			recordTracksEvent( 'calypso_signup_pattern_assembler_pattern_final_select', {
				...commonEventProps,
				pattern_id: id,
				pattern_name: name,
				pattern_category: category_slug,
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

	const onSelect = ( type: string, selectedPattern: Pattern ) => {
		if ( type ) {
			trackEventPatternSelect( {
				patternType: type,
				patternId: selectedPattern?.id,
				patternName: selectedPattern?.name,
			} );
		}

		if ( 'header' === type ) {
			updateHeader( selectedPattern );
		}
		if ( 'footer' === type ) {
			updateFooter( selectedPattern );
		}
		if ( 'section' === type ) {
			if ( sectionPosition !== null ) {
				replaceSection( selectedPattern );
			} else {
				addSection( selectedPattern );
			}
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
			trackEventPatternAdd( 'footer' );
		}
	};

	const stepContent = (
		<div className="pattern-assembler__wrapper">
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
						onReplaceSection={ ( position: number ) => {
							setSectionPosition( position );
						} }
						onDeleteSection={ ( position: number ) => {
							deleteSection( position );
						} }
						onMoveUpSection={ ( position: number ) => {
							moveUpSection( position );
						} }
						onMoveDownSection={ ( position: number ) => {
							moveDownSection( position );
						} }
					/>
				</NavigatorScreen>
				<NavigatorScreen path="/homepage/patterns">
					<ScreenPatternList
						selectedPattern={ sectionPosition ? sections[ sectionPosition ] : null }
						onSelect={ ( selectedPattern ) => onSelect( 'section', selectedPattern ) }
						onDoneClick={ () => onDoneClick( 'section' ) }
					/>
				</NavigatorScreen>

				<NavigatorListener onLocationChange={ setNavigatorLocation } />
			</NavigatorProvider>
			{ isEnabled( 'pattern-assembler/client-side-render' ) ? (
				<AsyncLoad require="./pattern-large-preview" { ...largePreviewProps } />
			) : (
				<AsyncLoad require="./pattern-assembler-preview" { ...largePreviewProps } />
			) }
		</div>
	);

	if ( ! site?.ID || ! selectedDesign ) {
		return null;
	}

	return (
		<StepContainer
			stepName="pattern-assembler"
			hideBack={ navigatorLocation !== '/' || flow === WITH_THEME_ASSEMBLER_FLOW }
			goBack={ onBack }
			goNext={ goNext }
			isHorizontalLayout={ false }
			isFullLayout={ true }
			hideSkip={ true }
			stepContent={
				isEnabled( 'pattern-assembler/client-side-render' ) ? (
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
				) : (
					stepContent
				)
			}
			recordTracksEvent={ recordTracksEvent }
			stepSectionName={ navigatorLocation !== '/' ? 'pattern-selector' : undefined }
		/>
	);
};

export default PatternAssembler;
