import { isEnabled } from '@automattic/calypso-config';
import { StepContainer, SITE_SETUP_FLOW, SITE_ASSEMBLER_FLOW } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { useState, useRef, useEffect } from 'react';
import { useDispatch as useReduxDispatch } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import DocumentHead from 'calypso/components/data/document-head';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { requestActiveTheme } from 'calypso/state/themes/actions';
import { useSite } from '../../../../hooks/use-site';
import { useSiteIdParam } from '../../../../hooks/use-site-id-param';
import { useSiteSlugParam } from '../../../../hooks/use-site-slug-param';
import { SITE_STORE, ONBOARD_STORE } from '../../../../stores';
import { recordSelectedDesign } from '../../analytics/record-design';
import { SITE_TAGLINE } from './constants';
import PatternLayout from './pattern-layout';
import PatternSelectorLoader from './pattern-selector-loader';
import { useAllPatterns } from './patterns-data';
import { encodePatternId, createCustomHomeTemplateContent } from './utils';
import type { Step } from '../../types';
import type { Pattern } from './types';
import type { DesignRecipe, Design } from '@automattic/design-picker/src/types';
import './style.scss';

const PatternAssembler: Step = ( { navigation, flow } ) => {
	const translate = useTranslate();
	const [ showPatternSelectorType, setShowPatternSelectorType ] = useState< string | null >( null );
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
				pattern_category: category,
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

	const onSelect = ( selectedPattern: Pattern ) => {
		if ( showPatternSelectorType ) {
			trackEventPatternSelect( {
				patternType: showPatternSelectorType,
				patternId: selectedPattern.id,
				patternName: selectedPattern.name,
			} );
		}

		if ( 'header' === showPatternSelectorType ) {
			updateHeader( selectedPattern );
		}
		if ( 'footer' === showPatternSelectorType ) {
			updateFooter( selectedPattern );
		}
		if ( 'section' === showPatternSelectorType ) {
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
						is_assembler_flow: true,
					} )
				)
				.then( () => reduxDispatch( requestActiveTheme( site?.ID || -1 ) ) )
		);

		recordSelectedDesign( { flow, intent, design } );
		submit?.();
	};

	const getSelectedPattern = () => {
		if ( 'header' === showPatternSelectorType ) {
			return header;
		}
		if ( 'footer' === showPatternSelectorType ) {
			return footer;
		}
		if ( 'section' === showPatternSelectorType && sectionPosition !== null ) {
			return sections[ sectionPosition ];
		}

		return null;
	};

	const stepContent = (
		<div className="pattern-assembler__wrapper">
			<div className="pattern-assembler__sidebar">
				<PatternSelectorLoader
					showPatternSelectorType={ showPatternSelectorType }
					onSelect={ onSelect }
					onDoneClick={ () => {
						const patterns = getPatterns( showPatternSelectorType );
						recordTracksEvent( 'calypso_signup_pattern_assembler_pattern_select_done_click', {
							pattern_type: showPatternSelectorType,
							pattern_ids: patterns.map( ( { id } ) => id ).join( ',' ),
							pattern_names: patterns.map( ( { name } ) => name ).join( ',' ),
						} );

						setShowPatternSelectorType( null );
					} }
					onBack={ () => {
						recordTracksEvent( 'calypso_signup_pattern_assembler_pattern_select_back_click', {
							pattern_type: showPatternSelectorType,
						} );

						setShowPatternSelectorType( null );
					} }
					selectedPattern={ getSelectedPattern() }
				/>
				{ ! showPatternSelectorType && (
					<PatternLayout
						header={ header }
						sections={ sections }
						footer={ footer }
						onAddHeader={ () => {
							trackEventPatternAdd( 'header' );
							setShowPatternSelectorType( 'header' );
						} }
						onReplaceHeader={ () => {
							setShowPatternSelectorType( 'header' );
						} }
						onDeleteHeader={ () => {
							updateHeader( null );
						} }
						onAddSection={ () => {
							trackEventPatternAdd( 'section' );
							setSectionPosition( null );
							setShowPatternSelectorType( 'section' );
						} }
						onReplaceSection={ ( position: number ) => {
							setSectionPosition( position );
							setShowPatternSelectorType( 'section' );
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
						onAddFooter={ () => {
							trackEventPatternAdd( 'footer' );
							setShowPatternSelectorType( 'footer' );
						} }
						onReplaceFooter={ () => {
							setShowPatternSelectorType( 'footer' );
						} }
						onDeleteFooter={ () => {
							updateFooter( null );
						} }
						onContinueClick={ () => {
							trackEventContinue();
							onSubmit();
						} }
					/>
				) }
			</div>
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
		<>
			<DocumentHead title={ translate( 'Design your home' ) } />
			<StepContainer
				stepName="pattern-assembler"
				hideBack={ showPatternSelectorType !== null || flow === SITE_ASSEMBLER_FLOW }
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
				stepSectionName={ showPatternSelectorType ? 'pattern-selector' : undefined }
			/>
		</>
	);
};

export default PatternAssembler;
