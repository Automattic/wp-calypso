import { StepContainer } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useState, useEffect } from 'react';
import { useDispatch as useReduxDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { requestActiveTheme } from 'calypso/state/themes/actions';
import { useSite } from '../../../../hooks/use-site';
import { useSiteIdParam } from '../../../../hooks/use-site-id-param';
import { useSiteSlugParam } from '../../../../hooks/use-site-slug-param';
import { SITE_STORE, ONBOARD_STORE } from '../../../../stores';
import PatternAssemblerPreview from './pattern-assembler-preview';
import PatternLayout from './pattern-layout';
import PatternSelectorLoader from './pattern-selector-loader';
import { encodePatternId } from './utils';
import type { Step } from '../../types';
import type { Pattern } from './types';
import type { DesignRecipe, Design } from '@automattic/design-picker/src/types';
import './style.scss';

const PatternAssembler: Step = ( { navigation } ) => {
	const [ showPatternSelectorType, setShowPatternSelectorType ] = useState< string | null >( null );
	const [ header, setHeader ] = useState< Pattern | null >( null );
	const [ footer, setFooter ] = useState< Pattern | null >( null );
	const [ sections, setSections ] = useState< Pattern[] >( [] );
	const [ sectionPosition, setSectionPosition ] = useState< number | null >( null );
	const { goBack, goNext, submit } = navigation;
	const { setDesignOnSite } = useDispatch( SITE_STORE );
	const reduxDispatch = useReduxDispatch();
	const { setPendingAction } = useDispatch( ONBOARD_STORE );
	const selectedDesign = useSelect( ( select ) => select( ONBOARD_STORE ).getSelectedDesign() );
	const site = useSite();
	const siteSlug = useSiteSlugParam();
	const siteId = useSiteIdParam();
	const siteSlugOrId = siteSlug ? siteSlug : siteId;

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

	const getPageTemplate = () => {
		let pageTemplate = 'footer-only';

		if ( header ) {
			pageTemplate = 'header-footer-only';
		}

		return pageTemplate;
	};

	const addSection = ( pattern: Pattern ) => {
		if ( sectionPosition !== null ) {
			setSections( [
				...sections.slice( 0, sectionPosition ),
				pattern,
				...sections.slice( sectionPosition + 1 ),
			] );
		} else {
			setSections( [ ...( sections as Pattern[] ), pattern ] );
		}
	};

	const deleteSection = ( position: number ) => {
		setSections( [ ...sections.slice( 0, position ), ...sections.slice( position + 1 ) ] );
	};

	const moveDownSection = ( position: number ) => {
		const section = sections[ position ];
		setSections( [
			...sections.slice( 0, position ),
			...sections.slice( position + 1, position + 2 ),
			section,
			...sections.slice( position + 2 ),
		] );
	};

	const moveUpSection = ( position: number ) => {
		const section = sections[ position ];
		setSections( [
			...sections.slice( 0, position - 1 ),
			section,
			...sections.slice( position - 1, position ),
			...sections.slice( position + 1 ),
		] );
	};

	const trackEventPattern = ( {
		patternType,
		patternId,
		eventType,
	}: {
		patternType: string;
		patternId: number;
		eventType: string;
	} ) => {
		let eventName;
		if ( eventType === 'select' ) {
			eventName = 'calypso_signup_bcpa_select_pattern_click';
		} else if ( eventType === 'delete' ) {
			eventName = 'calypso_signup_bcpa_delete_pattern_click';
		}

		recordTracksEvent( eventName, {
			pattern_type: patternType,
			pattern_id: patternId,
		} );
	};

	const onSelect = ( pattern: Pattern | null ) => {
		if ( pattern ) {
			if ( 'header' === showPatternSelectorType ) setHeader( pattern );
			if ( 'footer' === showPatternSelectorType ) setFooter( pattern );
			if ( 'section' === showPatternSelectorType ) addSection( pattern );

			if ( showPatternSelectorType ) {
				trackEventPattern( {
					patternType: showPatternSelectorType,
					patternId: pattern.id,
					eventType: 'select',
				} );
			}
		}
		setShowPatternSelectorType( null );
	};

	const onBack = () => {
		if ( showPatternSelectorType ) {
			setShowPatternSelectorType( null );
		} else {
			goBack();
		}
	};

	useEffect( () => {
		if ( showPatternSelectorType ) {
			recordTracksEvent( 'calypso_signup_bcpa_show_pattern_selector_click', {
				pattern_type: showPatternSelectorType,
			} );
		}
	}, [ showPatternSelectorType ] );

	const stepContent = (
		<div className="pattern-assembler__wrapper">
			<div className="pattern-assembler__sidebar">
				<PatternSelectorLoader
					showPatternSelectorType={ showPatternSelectorType }
					onSelect={ onSelect }
				/>
				{ ! showPatternSelectorType && (
					<PatternLayout
						header={ header }
						sections={ sections }
						footer={ footer }
						onSelectHeader={ () => {
							setShowPatternSelectorType( 'header' );
						} }
						onDeleteHeader={ () => {
							if ( header ) {
								trackEventPattern( {
									patternType: 'header',
									patternId: header.id,
									eventType: 'delete',
								} );
							}
							setHeader( null );
						} }
						onSelectSection={ ( position: number | null ) => {
							setSectionPosition( position );
							setShowPatternSelectorType( 'section' );
						} }
						onDeleteSection={ ( position: number ) => {
							trackEventPattern( {
								patternType: 'section',
								patternId: sections[ position ].id,
								eventType: 'delete',
							} );
							deleteSection( position );
						} }
						onMoveUpSection={ ( position: number ) => {
							moveUpSection( position );
						} }
						onMoveDownSection={ ( position: number ) => {
							moveDownSection( position );
						} }
						onSelectFooter={ () => {
							setShowPatternSelectorType( 'footer' );
						} }
						onDeleteFooter={ () => {
							if ( footer ) {
								trackEventPattern( {
									patternType: 'footer',
									patternId: footer.id,
									eventType: 'delete',
								} );
							}
							setFooter( null );
						} }
						onContinueClick={ () => {
							if ( siteSlugOrId ) {
								const design = getDesign();
								const pageTemplate = getPageTemplate();

								setPendingAction( () =>
									setDesignOnSite( siteSlugOrId, design, { pageTemplate } ).then( () =>
										reduxDispatch( requestActiveTheme( site?.ID || -1 ) )
									)
								);

								submit?.();

								const patterns = [ header, ...sections, footer ].filter(
									( pattern ) => pattern
								) as Pattern[];
								recordTracksEvent( 'calypso_signup_bcpa_donecontinue_click', {
									pattern_ids: patterns.map( ( { id } ) => id ),
									pattern_names: patterns.map( ( { name } ) => name ),
									pattern_count: patterns.length,
								} );
							}
						} }
					/>
				) }
			</div>
			<PatternAssemblerPreview header={ header } sections={ sections } footer={ footer } />
		</div>
	);

	return (
		<StepContainer
			stepName={ 'pattern-assembler' }
			goBack={ onBack }
			goNext={ goNext }
			isHorizontalLayout={ false }
			hideSkip={ true }
			stepContent={ stepContent }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default PatternAssembler;
