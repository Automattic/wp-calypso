import { addQueryArgs, getQueryArg } from '@wordpress/url';
import clsx from 'clsx';
import { useState, useEffect } from 'react';
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
import { getSetpProgressSteps } from './utils';

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

function getTitle( urlData?: UrlData ) {
	if ( urlData?.platform === 'substack' && urlData?.meta?.title ) {
		return `Import ${ urlData.meta.title }`;
	}

	return 'Import your newsletter';
}

export default function NewsletterImporter( {
	siteSlug,
	engine,
	step = 'content',
}: NewsletterImporterProps ) {
	const fromSite = getQueryArg( window.location.href, 'from' ) as string;
	const selectedSite = useSelector( getSelectedSite ) ?? undefined;

	const [ validFromSite, setValidFromSite ] = useState( false );
	const [ autoFetchData, setAutoFetchData ] = useState( false );

	const { data: paidNewsletterData, isFetching: isFetchingPaidNewsletter } = usePaidNewsletterQuery(
		engine,
		step,
		selectedSite?.ID,
		autoFetchData
	);

	useEffect( () => {
		if (
			paidNewsletterData?.steps?.content?.status === 'importing' ||
			paidNewsletterData?.steps.subscribers?.status === 'importing'
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
		isError: urlError,
	} = useAnalyzeUrlQuery( fromSite );

	useEffect( () => {
		if ( urlData?.platform === engine ) {
			if ( selectedSite && step === stepSlugs[ 0 ] && validFromSite === false ) {
				resetPaidNewsletter( selectedSite.ID, engine, stepSlugs[ 0 ] );
			}

			setValidFromSite( true );
		}
	}, [ urlData, fromSite, engine, selectedSite, resetPaidNewsletter, step, validFromSite ] );

	const stepsProgress = getSetpProgressSteps(
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

	return (
		<div className={ clsx( 'newsletter-importer', 'newsletter-importer__step-' + step ) }>
			<LogoChain logos={ logoChainLogos } />
			<FormattedHeader headerText={ getTitle( urlData ) } />

			{ ( ! validFromSite || isResetPaidNewsletterPending ) && (
				<SelectNewsletterForm
					stepUrl={ stepUrl }
					urlData={ urlData }
					isLoading={ isUrlFetching || isResetPaidNewsletterPending }
					engine={ engine }
					value={ fromSite }
					urlError={ urlError }
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
							isFetchingContent={ isFetchingPaidNewsletter }
							setAutoFetchData={ setAutoFetchData }
						/>
					) }
					{ step === 'summary' && (
						<Summary selectedSite={ selectedSite } steps={ paidNewsletterData.steps } />
					) }
				</>
			) }
		</div>
	);
}
