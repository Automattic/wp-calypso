import { useState } from 'react';
import { StepContainer } from 'calypso/../packages/onboarding/src';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import PatternLayout from './pattern-layout';
import PatternSelectorLoader from './pattern-selector-loader';
import type { Step } from '../../types';
import type { Pattern } from './types';
import './style.scss';

const PatternAssembler: Step = ( { navigation } ) => {
	const [ showPatternSelectorType, setShowPatternSelectorType ] = useState< string | null >( null );
	const [ header, setHeader ] = useState< Pattern | null >( null );
	const [ footer, setFooter ] = useState< Pattern | null >( null );
	const [ sections, setSections ] = useState< Pattern[] >( [] );
	const [ section, setSection ] = useState< Pattern | null >( null );
	const { goNext, goBack } = navigation;

	const addSection = ( pattern: Pattern ) => {
		if ( section ) {
			const sectionIndex = sections.findIndex( ( { id } ) => id === section.id );
			setSections( [
				...sections.slice( 0, sectionIndex ),
				pattern,
				...sections.slice( sectionIndex + 1 ),
			] );
		} else {
			setSections( [ ...( sections as Pattern[] ), pattern ] );
		}
	};

	const removeSection = ( section: Pattern ) => {
		const sectionIndex = sections.findIndex( ( { id } ) => id === section.id );
		setSections( [ ...sections.slice( 0, sectionIndex ), ...sections.slice( sectionIndex + 1 ) ] );
	};

	const onSelect = ( pattern: Pattern | null ) => {
		if ( pattern ) {
			if ( 'header' === showPatternSelectorType ) setHeader( pattern );
			if ( 'footer' === showPatternSelectorType ) setFooter( pattern );
			if ( 'section' === showPatternSelectorType ) addSection( pattern );
		} else {
			// When a pattern is unselected
			if ( 'header' === showPatternSelectorType && header ) setHeader( null );
			if ( 'footer' === showPatternSelectorType && footer ) setFooter( null );
			if ( 'section' === showPatternSelectorType && section ) removeSection( section );
		}

		setShowPatternSelectorType( null );
	};

	const getPatternSelected = (): Pattern | null => {
		if ( 'header' === showPatternSelectorType ) return header;
		if ( 'footer' === showPatternSelectorType ) return footer;
		if ( 'section' === showPatternSelectorType ) return section;
		return null;
	};

	const stepContent = (
		<div className="pattern-assembler__wrapper">
			<div className="pattern-assembler__sidebar">
				<PatternSelectorLoader
					showPatternSelectorType={ showPatternSelectorType }
					pattern={ getPatternSelected() }
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
						onSelectSection={ ( pattern ) => {
							setSection( pattern );
							setShowPatternSelectorType( 'section' );
						} }
						onSelectFooter={ () => {
							setShowPatternSelectorType( 'footer' );
						} }
						onDeleteHeader={ () => {
							// TODO
						} }
						onDeleteSection={ () => {
							// TODO
						} }
						onDeleteFooter={ () => {
							// TODO
						} }
						onContinueClick={ () => {
							// TODO
						} }
					/>
				) }
			</div>
			<div className="pattern-assembler__preview">
				<h3> Web preview placeholder </h3>
			</div>
		</div>
	);

	return (
		<StepContainer
			stepName={ 'pattern-assembler' }
			goBack={ goBack }
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
