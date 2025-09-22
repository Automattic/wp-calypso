import { __, sprintf } from '@wordpress/i18n';
import clsx from 'clsx';
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { UrlData } from 'calypso/blocks/import/types';
import FormattedHeader from 'calypso/components/formatted-header';
import StepProgress from 'calypso/components/step-progress';
import {
	StepId,
	usePaidNewsletterQuery,
} from 'calypso/data/paid-newsletter/use-paid-newsletter-query';
import { useResetMutation } from 'calypso/data/paid-newsletter/use-reset-mutation';
import { useSkipNextStepMutation } from 'calypso/data/paid-newsletter/use-skip-next-step-mutation';
import { useAnalyzeUrlQuery } from 'calypso/data/site-profiler/use-analyze-url-query';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { SelectNewsletterForm } from 'calypso/my-sites/importer/newsletter/components';
import LogoChain from 'calypso/my-sites/importer/newsletter/components/logo-chain';
import Content from 'calypso/my-sites/importer/newsletter/content';
import Subscribers from 'calypso/my-sites/importer/newsletter/subscribers';
import Summary from 'calypso/my-sites/importer/newsletter/summary';
import { EngineTypes } from 'calypso/my-sites/importer/newsletter/types';
import { getImporterStatus } from 'calypso/my-sites/importer/newsletter/utils';
import { useCompleteImportSubscribersTask } from 'calypso/my-sites/subscribers/hooks/use-complete-import-subscribers-task';
import { resetImport, startImport } from 'calypso/state/imports/actions';
import { importSite } from 'calypso/state/imports/site-importer/actions';
import { Importer, ImporterBaseProps } from '../types';
import { getStepsProgress } from './utils';

import './style.scss';

const stepSlugs: StepId[] = [ 'content', 'subscribers', 'summary' ];

const logoChainLogos = [
	{ name: 'substack', color: 'var(--color-substack)' },
	{ name: 'wordpress', color: '#3858E9' },
];

function getTitle( engine: EngineTypes, urlData?: UrlData ) {
	if ( urlData?.meta?.title && urlData?.platform === engine ) {
		return sprintf(
			// translators: %s is the site name
			__( 'Import %s' ),
			urlData.meta.title
		);
	}

	return __( 'Import your newsletter' );
}

export const SubstackImporter: React.FunctionComponent< ImporterBaseProps > = ( props ) => {
	const importer: Importer = 'substack';
	const engine = importer;

	const [ step, setStep ] = useState< StepId >( 'content' );

	const { siteSlug, site, fromSite: fromSiteProp } = props;
	const selectedSite = site;

	const [ fromSite, setFromSite ] = useState( fromSiteProp );

	const importerStep = useQuery().get( 'importerStep' );

	const [ validFromSite, setValidFromSite ] = useState( false );
	const [ autoFetchData, setAutoFetchData ] = useState( false );
	const [ shouldResetImport, setShouldResetImport ] = useState( step === 'reset' );
	const completeImportSubscribersTask = useCompleteImportSubscribersTask();
	const previousFromSite = useRef( fromSite );

	// Reset validFromSite when fromSite changes or is removed
	useEffect( () => {
		if ( fromSite !== previousFromSite.current ) {
			setValidFromSite( false );
			previousFromSite.current = fromSite;
		}
	}, [ fromSite ] );

	useEffect( () => {
		if ( importerStep && stepSlugs.includes( importerStep as StepId ) ) {
			setStep( importerStep as StepId );
		}
	}, [] );

	const { data: paidNewsletterData } = usePaidNewsletterQuery(
		importer,
		step,
		selectedSite?.ID,
		autoFetchData,
		'import-paid-subscribers-stepper'
	);

	useEffect( () => {
		if (
			paidNewsletterData?.steps?.content?.status === 'importing' ||
			paidNewsletterData?.steps?.subscribers?.status === 'importing'
		) {
			setAutoFetchData( true );
		} else {
			setAutoFetchData( false );
		}
	}, [
		paidNewsletterData?.steps?.content?.status,
		paidNewsletterData?.steps?.subscribers?.status,
		step,
		setAutoFetchData,
		paidNewsletterData?.steps,
	] );

	useEffect( () => {
		// Mark the task complete once importing starts. Since we prompt users to leave the page while
		// importing is happening, it may not be called if we wait until completion.
		if ( paidNewsletterData?.steps?.subscribers?.status === 'importing' ) {
			// We do this here instead of in the Subscribers component because steps skip over the
			// component when not importing paid subscribers.
			completeImportSubscribersTask();
		}
	}, [ paidNewsletterData?.steps?.subscribers?.status, completeImportSubscribersTask ] );

	const { currentStepNumber, nextStepSlug } = stepSlugs.reduce(
		function ( result, curr, index ) {
			if ( curr === step ) {
				result.currentStepNumber = index;
				result.nextStepSlug = stepSlugs[ index + 1 ] ? stepSlugs[ index + 1 ] : stepSlugs[ index ];
			}

			return result;
		},
		{
			currentStepNumber: 0,
			nextStepSlug: stepSlugs[ 1 ],
		}
	);

	const { skipNextStep } = useSkipNextStepMutation();
	const { resetPaidNewsletter, isPending: isResetPaidNewsletterPending } = useResetMutation();

	const {
		data: urlData,
		isFetching: isUrlFetching,
		isError: isUrlError,
	} = useAnalyzeUrlQuery( fromSite );

	useEffect( () => {
		if ( urlData?.platform === importer ) {
			if ( selectedSite && shouldResetImport && validFromSite === false ) {
				resetPaidNewsletter( selectedSite.ID, importer, stepSlugs[ 0 ], fromSite );
				setShouldResetImport( false );
			}

			setValidFromSite( true );
		}
	}, [
		urlData,
		fromSite,
		engine,
		selectedSite,
		resetPaidNewsletter,
		step,
		validFromSite,
		shouldResetImport,
	] );

	const stepsProgress = getStepsProgress( setStep, paidNewsletterData );

	// Helps only show the confetti once even if you navigate between the different steps.
	const shouldShowConfettiRef = useRef( false );
	const [ showConfetti, setShowConfetti ] = useState( false );
	const importerStatus = getImporterStatus( paidNewsletterData?.steps );

	useEffect( () => {
		if ( importerStatus === 'done' && ! shouldShowConfettiRef.current ) {
			shouldShowConfettiRef.current = true;
			setShowConfetti( true );
		}
	}, [ importerStatus, showConfetti ] );

	return (
		<div className={ clsx( 'newsletter-importer', 'newsletter-importer__step-' + step ) }>
			<LogoChain logos={ logoChainLogos } />
			<FormattedHeader headerText={ getTitle( engine, urlData ) } />

			{ validFromSite && ! isResetPaidNewsletterPending && (
				<StepProgress steps={ stepsProgress } currentStep={ currentStepNumber } />
			) }

			{ ( ! validFromSite || isResetPaidNewsletterPending ) && (
				<SelectNewsletterForm
					onContinue={ ( fromSiteOnContinue ) => {
						setStep( 'content' );
						setFromSite( fromSiteOnContinue );
					} }
					value={ fromSite }
					isLoading={ isUrlFetching || isResetPaidNewsletterPending }
					isError={ isUrlError || ( !! urlData?.platform && urlData.platform !== engine ) }
				/>
			) }

			{ selectedSite && validFromSite && ! isResetPaidNewsletterPending && paidNewsletterData && (
				<>
					{ step === 'content' && (
						<Content
							engine={ engine }
							selectedSite={ selectedSite }
							fromSite={ fromSite }
							siteSlug={ siteSlug }
							onContinue={ () => setStep( 'subscribers' ) }
							skipNextStep={ () => {
								setStep( 'subscribers' );
								skipNextStep( selectedSite.ID, engine, nextStepSlug, step );
							} }
						/>
					) }
					{ step === 'subscribers' && (
						<Subscribers
							siteSlug={ siteSlug }
							selectedSite={ selectedSite }
							fromSite={ fromSite }
							onViewSummaryClick={ () => setStep( 'summary' ) }
							skipNextStep={ () => {
								setStep( 'summary' );
								skipNextStep( selectedSite.ID, engine, nextStepSlug, step );
							} }
							cardData={ paidNewsletterData.steps[ step ]?.content }
							engine={ engine }
							status={ paidNewsletterData.steps[ step ]?.status || 'initial' }
							setAutoFetchData={ setAutoFetchData }
						/>
					) }
					{ step === 'summary' && (
						<Summary
							selectedSite={ selectedSite }
							onResetImporter={ () => setStep( 'content' ) }
							steps={ paidNewsletterData.steps }
							engine={ engine }
							fromSite={ fromSite }
							showConfetti={ showConfetti }
							shouldShownConfetti={ setShowConfetti }
						/>
					) }
				</>
			) }
		</div>
	);
};

export default connect( null, {
	importSite,
	startImport,
	resetImport,
} )( SubstackImporter );
