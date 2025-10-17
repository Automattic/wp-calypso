import { ProgressBar } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
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
import { useSetOriginSiteMutation } from 'calypso/data/paid-newsletter/use-set-origin-site-mutation';
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

	const [ step, setStepState ] = useState< StepId >( 'content' );

	const setStep = ( newStep: StepId ) => {
		setStepState( newStep );
		const newUrl = addQueryArgs( window.location.href, { importerStep: newStep } );

		window.history.replaceState( {}, '', newUrl );
	};

	const { siteSlug, site, fromSite: fromSiteProp } = props;
	const selectedSite = site;

	const importerStep = useQuery().get( 'importerStep' );

	const [ autoFetchData, setAutoFetchData ] = useState( false );

	const completeImportSubscribersTask = useCompleteImportSubscribersTask();

	const { setOriginSite, isPending: isSetOriginSitePending } = useSetOriginSiteMutation();

	/**
	 * Pass the fromSite prop to the mutation to set the origin site when
	 * coming from the Calypso migration flow (/setup/site-migration/site-migration-identify).
	 */
	useEffect( () => {
		if ( fromSiteProp && selectedSite ) {
			setOriginSite( selectedSite.ID, engine, stepSlugs[ 0 ], fromSiteProp );
		}
	}, [] );

	useEffect( () => {
		if ( importerStep && stepSlugs.includes( importerStep as StepId ) ) {
			setStep( importerStep as StepId );
		}
	}, [] );

	const { data: paidNewsletterData, isLoading: isPaidNewsletterLoading } = usePaidNewsletterQuery(
		importer,
		step,
		selectedSite?.ID,
		autoFetchData,
		'import-paid-subscribers-stepper'
	);

	const fromSite = paidNewsletterData?.import_url;

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
	} = useAnalyzeUrlQuery( fromSite ?? '' );

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

	const isLoading =
		isUrlFetching ||
		isResetPaidNewsletterPending ||
		isSetOriginSitePending ||
		isPaidNewsletterLoading;

	if ( isLoading ) {
		return (
			<div className={ clsx( 'newsletter-importer', 'newsletter-importer__step-' + step ) }>
				<div className="step-container-v2--loading import-layout__center">
					<ProgressBar className="step-container-v2--loading__progress-bar" />
				</div>
			</div>
		);
	}

	return (
		<div className={ clsx( 'newsletter-importer', 'newsletter-importer__step-' + step ) }>
			<LogoChain logos={ logoChainLogos } />
			<FormattedHeader headerText={ getTitle( engine, urlData ) } />

			{ !! fromSite && ! isLoading && (
				<StepProgress steps={ stepsProgress } currentStep={ currentStepNumber } />
			) }

			{ ( ! fromSite || isResetPaidNewsletterPending ) && ! isLoading && (
				<SelectNewsletterForm
					onContinue={ ( fromSiteOnContinue ) => {
						resetPaidNewsletter( selectedSite.ID, engine, stepSlugs[ 0 ], fromSiteOnContinue );
					} }
					value={ fromSite ?? '' }
					isError={ isUrlError || ( !! urlData?.platform && urlData.platform !== engine ) }
				/>
			) }

			{ selectedSite && fromSite && ! isLoading && (
				<>
					{ step === 'content' && (
						<Content
							engine={ engine }
							selectedSite={ selectedSite }
							fromSite={ fromSite }
							siteSlug={ siteSlug }
							onContinue={ () => setStep( nextStepSlug ) }
							skipNextStep={ () => {
								setStep( nextStepSlug );
								skipNextStep( selectedSite.ID, engine, nextStepSlug, step );
							} }
						/>
					) }
					{ step === 'subscribers' && (
						<Subscribers
							siteSlug={ siteSlug }
							selectedSite={ selectedSite }
							fromSite={ fromSite }
							onViewSummaryClick={ () => setStep( nextStepSlug ) }
							skipNextStep={ () => {
								setStep( nextStepSlug );
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
							onImportExpired={ () => {
								setStep( stepSlugs[ 0 ] );
							} }
							onResetImporter={ () => {
								setStep( stepSlugs[ 0 ] );
								resetPaidNewsletter( selectedSite.ID, engine, stepSlugs[ 0 ] );
							} }
							steps={ paidNewsletterData.steps }
							fromSite={ fromSite }
							showConfetti={ showConfetti }
							shouldShownConfetti={ setShowConfetti }
							resetImporter={ function (): void {
								setStep( stepSlugs[ 0 ] );
								resetPaidNewsletter( selectedSite.ID, engine, stepSlugs[ 0 ] );
							} }
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
