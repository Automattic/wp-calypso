import { __, sprintf } from '@wordpress/i18n';
import { addQueryArgs, getQueryArg } from '@wordpress/url';
import clsx from 'clsx';
import { useState, useEffect, useRef } from 'react';
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
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import Content from './content';
import LogoChain from './logo-chain';
import SelectNewsletterForm from './select-newsletter-form';
import Subscribers from './subscribers';
import Summary from './summary';
import { EngineTypes } from './types';
import { getStepsProgress, getImporterStatus } from './utils';

import './importer.scss';

const stepSlugs: StepId[] = [ 'content', 'subscribers', 'summary' ];

const logoChainLogos = [
	{ name: 'substack', color: 'var(--color-substack)' },
	{ name: 'wordpress', color: '#3858E9' },
];

type NewsletterImporterProps = {
	siteSlug: string;
	engine: EngineTypes;
	step?: StepId;
};

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

function updatePathToContent( path: string ) {
	if ( path.endsWith( '/content' ) ) {
		return path;
	}
	return path + '/content';
}

export default function NewsletterImporter( {
	siteSlug,
	engine,
	step = 'reset',
}: NewsletterImporterProps ) {
	const fromSite = getQueryArg( window.location.href, 'from' ) as string;
	const selectedSite = useSelector( getSelectedSite ) ?? undefined;

	const [ validFromSite, setValidFromSite ] = useState( false );
	const [ autoFetchData, setAutoFetchData ] = useState( false );
	const [ shouldResetImport, setShouldResetImport ] = useState( step === 'reset' );
	const previousFromSite = useRef( fromSite );

	// Reset validFromSite when fromSite changes or is removed
	useEffect( () => {
		if ( fromSite !== previousFromSite.current ) {
			setValidFromSite( false );
			previousFromSite.current = fromSite;
		}
	}, [ fromSite ] );

	if ( step === 'reset' ) {
		step = 'content';
	}

	const { data: paidNewsletterData } = usePaidNewsletterQuery(
		engine,
		step,
		selectedSite?.ID,
		autoFetchData
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
		if ( urlData?.platform === engine ) {
			if ( selectedSite && shouldResetImport && validFromSite === false ) {
				resetPaidNewsletter( selectedSite.ID, engine, stepSlugs[ 0 ], fromSite );
				setShouldResetImport( false );
				window.history.replaceState(
					null,
					'',
					updatePathToContent( window.location.pathname ) + window.location.search
				);
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

	const stepsProgress = getStepsProgress(
		engine,
		selectedSite?.slug || '',
		fromSite,
		paidNewsletterData
	);
	const stepUrl = `/import/newsletter/${ engine }/${ siteSlug }/${ step }`;
	const nextStepUrl = addQueryArgs(
		`/import/newsletter/${ engine }/${ siteSlug }/${ nextStepSlug }`,
		{
			from: fromSite,
		}
	);

	// Helps only show the confetti once even if you navigate between the different steps.
	const shouldShowConfettiRef = useRef( false );
	const [ showConfetti, setShowConfetti ] = useState( false );
	const importerStatus = getImporterStatus(
		paidNewsletterData?.steps?.content?.status,
		paidNewsletterData?.steps?.subscribers.status
	);

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

			{ ( ! validFromSite || isResetPaidNewsletterPending ) && (
				<SelectNewsletterForm
					redirectUrl={ stepUrl }
					value={ fromSite }
					isLoading={ isUrlFetching || isResetPaidNewsletterPending }
					isError={ isUrlError || ( !! urlData?.platform && urlData.platform !== engine ) }
				/>
			) }

			{ validFromSite && ! isResetPaidNewsletterPending && (
				<StepProgress steps={ stepsProgress } currentStep={ currentStepNumber } />
			) }

			{ selectedSite && validFromSite && ! isResetPaidNewsletterPending && paidNewsletterData && (
				<>
					{ step === 'content' && (
						<Content
							nextStepUrl={ nextStepUrl }
							engine={ engine }
							selectedSite={ selectedSite }
							fromSite={ fromSite }
							siteSlug={ siteSlug }
							skipNextStep={ () => {
								skipNextStep( selectedSite.ID, engine, nextStepSlug, step );
							} }
						/>
					) }
					{ step === 'subscribers' && (
						<Subscribers
							siteSlug={ siteSlug }
							nextStepUrl={ nextStepUrl }
							selectedSite={ selectedSite }
							fromSite={ fromSite }
							skipNextStep={ () => {
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
}
