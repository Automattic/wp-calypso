import { StepContainer } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { useState } from 'react';
import { useDispatch as useReduxDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { requestActiveTheme } from 'calypso/state/themes/actions';
import { useSite } from '../../../../hooks/use-site';
import { useSiteIdParam } from '../../../../hooks/use-site-id-param';
import { useSiteSlugParam } from '../../../../hooks/use-site-slug-param';
import { SITE_STORE, ONBOARD_STORE } from '../../../../stores';
import { STYLE_SHEET } from './constants';
import PatternAssemblerPreview from './pattern-assembler-preview';
import PatternLayout from './pattern-layout';
import PatternSelectorLoader from './pattern-selector-loader';
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
	const { setSelectedDesign, setPendingAction } = useDispatch( ONBOARD_STORE );
	const site = useSite();
	const siteSlug = useSiteSlugParam();
	const siteId = useSiteIdParam();
	const siteSlugOrId = siteSlug ? siteSlug : siteId;

	const getDesign = () =>
		( {
			recipe: {
				stylesheet: STYLE_SHEET,
				header_pattern_ids: [ header?.id ],
				pattern_ids: sections.map( ( { id } ) => id ),
				footer_pattern_ids: [ footer?.id ],
			} as DesignRecipe,
			slug: 'blank-canvas-blocks',
			title: 'Blank Canvas',
			verticalizable: false,
		} as Design );

	const addSection = ( pattern: Pattern ) => {
		if ( sectionPosition ) {
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

	const onSelect = ( pattern: Pattern | null ) => {
		if ( pattern ) {
			if ( 'header' === showPatternSelectorType ) setHeader( pattern );
			if ( 'footer' === showPatternSelectorType ) setFooter( pattern );
			if ( 'section' === showPatternSelectorType ) addSection( pattern );
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
							setHeader( null );
						} }
						onSelectSection={ ( position: number | null ) => {
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
						onSelectFooter={ () => {
							setShowPatternSelectorType( 'footer' );
						} }
						onDeleteFooter={ () => {
							setFooter( null );
						} }
						onContinueClick={ () => {
							if ( siteSlugOrId ) {
								const design = getDesign();
								setSelectedDesign( design );

								setPendingAction( () =>
									setDesignOnSite( siteSlugOrId, design ).then( () =>
										reduxDispatch( requestActiveTheme( site?.ID || -1 ) )
									)
								);

								submit?.( { selectedDesign: design } );
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
			isWideLayout={ true }
			hideSkip={ true }
			stepContent={ stepContent }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default PatternAssembler;
