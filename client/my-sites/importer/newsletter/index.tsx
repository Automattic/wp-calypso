import { __, sprintf } from '@wordpress/i18n';
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
import { useCompleteImportSubscribersTask } from 'calypso/my-sites/subscribers/hooks/use-complete-import-subscribers-task';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { LogoChain, SelectNewsletterForm } from './components';
import Content from './content';
import Subscribers from './subscribers';
import Summary from './summary';
import { EngineTypes } from './types';
import { getStepsProgress, getImporterStatus } from './utils';

import './style.scss';

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

export default function NewsletterImporter( {
	siteSlug,
	engine,
	step = 'reset',
}: NewsletterImporterProps ) {
	const selectedSite = useSelector( getSelectedSite ) ?? undefined;
	const [ autoFetchData, setAutoFetchData ] = useState( false );
	const completeImportSubscribersTask = useCompleteImportSubscribersTask();

	if ( step === 'reset' ) {
		step = 'content';
	}

	const { data: paidNewsletterData } = usePaidNewsletterQuery(
		engine,
		step,
		selectedSite?.ID,
		autoFetchData
	);
	const { content, subscribers } = paidNewsletterData?.steps || {};
	const originSite = content?.content?.originSite || '';

	useEffect( () => {
		if ( content?.status === 'importing' || subscribers?.status === 'importing' ) {
			setAutoFetchData( true );
		} else {
			setAutoFetchData( false );
		}
	}, [ content?.status, subscribers?.status, step, setAutoFetchData, paidNewsletterData?.steps ] );

	useEffect( () => {
		// Mark the task complete once importing starts. Since we prompt users to leave the page while
		// importing is happening, it may not be called if we wait until completion.
		if ( subscribers?.status === 'importing' ) {
			// We do this here instead of in the Subscribers component because steps skip over the
			// component when not importing paid subscribers.
			completeImportSubscribersTask();
		}
	}, [ subscribers?.status, completeImportSubscribersTask ] );

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
	const { isPending: isResetPaidNewsletterPending, resetPaidNewsletter } = useResetMutation();

	const {
		data: urlData,
		isFetching: isUrlFetching,
		isError: isUrlError,
	} = useAnalyzeUrlQuery( originSite );

	const stepsProgress = getStepsProgress(
		engine,
		selectedSite?.slug || '',
		originSite,
		paidNewsletterData
	);
	const nextStepUrl = `/import/newsletter/${ engine }/${ siteSlug }/${ nextStepSlug }`;

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

	const resetImporter = () => {
		if ( selectedSite?.ID ) {
			resetPaidNewsletter( selectedSite?.ID, engine, 'reset' );
		}
	};

	return (
		<div className={ clsx( 'newsletter-importer', 'newsletter-importer__step-' + step ) }>
			<LogoChain logos={ logoChainLogos } />
			<FormattedHeader headerText={ getTitle( engine, urlData ) } />

			{ ( ! originSite || isResetPaidNewsletterPending ) && (
				<SelectNewsletterForm
					siteId={ selectedSite?.ID ?? 0 }
					value={ originSite }
					siteSlug={ siteSlug }
					engine={ engine }
					isLoading={ isUrlFetching || isResetPaidNewsletterPending }
					isError={ isUrlError || ( !! urlData?.platform && urlData.platform !== engine ) }
				/>
			) }

			{ originSite && ! isResetPaidNewsletterPending && (
				<StepProgress steps={ stepsProgress } currentStep={ currentStepNumber } />
			) }

			{ selectedSite && originSite && ! isResetPaidNewsletterPending && paidNewsletterData && (
				<>
					{ step === 'content' && (
						<Content
							nextStepUrl={ nextStepUrl }
							engine={ engine }
							selectedSite={ selectedSite }
							originSite={ originSite }
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
							originSite={ originSite }
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
							resetImporter={ resetImporter }
							fromSite={ originSite }
							showConfetti={ showConfetti }
							shouldShownConfetti={ setShowConfetti }
						/>
					) }
				</>
			) }
		</div>
	);
}
