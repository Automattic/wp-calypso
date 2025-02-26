/* eslint-disable wpcalypso/jsx-classname-namespace */
import { Analyzer } from '@automattic/data-stores';
import { StepContainer, SubTitle, Title } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { delay, uniqBy } from 'lodash';
import React, { useEffect, useState } from 'react';
import AnalysisProgress from 'calypso/blocks/import-light/analysis-progress';
import Capture from 'calypso/blocks/import-light/capture';
import Colors from 'calypso/blocks/import-light/colors';
import Summary from 'calypso/blocks/import-light/summary';
import DocumentHead from 'calypso/components/data/document-head';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { ProgressState } from './types';
import type { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import './style.scss';

const ImportLight: Step = function ImportStep( props ) {
	const { __ } = useI18n();
	const { navigation } = props;

	const siteSlug = useSiteSlugParam();
	const [ url, setUrl ] = useState( '' );
	const [ progressState, setProgressState ] = useState< ProgressState >( 'capture' );
	const [ percentage, setPercentage ] = useState( 2 );
	const { analyzeColors } = useDispatch( Analyzer.store );
	const colorsData = useSelect(
		( select ) => select( Analyzer.store ).getSiteColors( url ),
		[ url ]
	);
	const fetchingColorsInProgress = useSelect(
		( select ) => select( Analyzer.store ).isSiteColorsInAnalysis(),
		[]
	);

	useEffect( () => {
		if ( progressState === 'scanning' && ! fetchingColorsInProgress ) {
			makeProgress( 'import-colors', 66 );
		}
	} );

	function makeProgress( state: ProgressState, percent?: number, delayMs = 0 ) {
		delay( () => {
			setProgressState( state );
			percent !== undefined && setPercentage( percent );
		}, delayMs );
	}

	function onUrlEnter( url: string ) {
		setUrl( url );
		analyzeColors( url );
		makeProgress( 'scanning', 13, 0 );
		makeProgress( 'scanning', 33, 500 );
	}

	function goToImportListStep() {
		navigation.goToStep?.( `importList?siteSlug=${ siteSlug }&backToStep=importLight` );
	}

	function onColorAnimationFinish() {
		makeProgress( 'import-colors-complete', 100, 2000 );
		makeProgress( 'summary', 100, 3500 );
	}

	function getColors() {
		const palette = colorsData?.preferred_palettes[ 0 ];
		const colors = palette ? [ palette?.background, palette?.link, palette?.text ] : [];

		return uniqBy( colors, 'name' );
	}

	function renderStepContent() {
		const colors = getColors();

		switch ( progressState ) {
			case 'scanning':
			case 'import-colors':
			case 'import-colors-complete':
				return (
					<AnalysisProgress percentage={ percentage }>
						{ progressState === 'scanning' && <Title>{ __( 'Scanning your site' ) }</Title> }
						{ ( progressState === 'import-colors' ||
							progressState === 'import-colors-complete' ) && (
							<Title>{ __( 'Importing colors' ) }</Title>
						) }

						{ progressState === 'scanning' && <SubTitle>{ url }</SubTitle> }
						{ progressState === 'import-colors' && (
							<Colors colors={ colors } onColorAnimationFinish={ onColorAnimationFinish } />
						) }
						{ progressState === 'import-colors-complete' && (
							<SubTitle>
								{ createInterpolateElement(
									sprintf(
										/* translators: the colorsNum could be any number from 0 to about ~10 */
										__( 'We imported <span>%(colorsNum)s color swatches.</span>' ),
										{ colorsNum: colors.length }
									),
									{
										span: createElement( 'span' ),
									}
								) }
							</SubTitle>
						) }
					</AnalysisProgress>
				);

			case 'summary':
				return (
					<Summary
						colorsNum={ colors.length }
						onContinueClick={ () => navigation.goToStep?.( 'design-setup' ) }
					/>
				);

			case 'capture':
			default:
				return (
					<Capture onInputEnter={ onUrlEnter } onDontHaveSiteAddressClick={ goToImportListStep } />
				);
		}
	}

	return (
		<>
			<DocumentHead title={ __( 'Import light' ) } />

			<StepContainer
				stepName="import-step"
				className="import__onboarding-page"
				hideSkip={ false }
				hideFormattedHeader
				goBack={ navigation.goBack }
				goNext={ navigation.goNext }
				skipLabelText={ __( 'Skip this step' ) }
				isFullLayout
				stepContent={ renderStepContent() }
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default ImportLight;
