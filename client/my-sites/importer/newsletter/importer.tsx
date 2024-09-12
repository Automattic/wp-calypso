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
import { LogoChain } from './logo-chain/logo-chain';
import SelectNewsletterForm from './select-newsletter-form';
import Subscribers from './subscribers';
import Summary from './summary';
import { EngineTypes, StatusType } from './types';
import { getSetpProgressSteps } from './utils';

import './importer.scss';

const steps = [ Content, Subscribers, Summary ];

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
	if ( urlData?.meta?.title ) {
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

	// Steps
	let stepIndex = 0;
	let nextStep = stepSlugs[ 0 ];

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

	stepSlugs.forEach( ( stepName, index ) => {
		if ( stepName === step ) {
			stepIndex = index;
			nextStep = stepSlugs[ index + 1 ] ? stepSlugs[ index + 1 ] : stepSlugs[ index ];
		}
	} );

	const { skipNextStep } = useSkipNextStepMutation();
	const { resetPaidNewsletter, isPending: isResetPaidNewsletterPending } = useResetMutation();

	const { data: urlData, isFetching } = useAnalyzeUrlQuery( fromSite );

	let stepContent = {};
	let stepStatus: StatusType = 'initial';
	if ( paidNewsletterData?.steps ) {
		// This is useful for the summary step.
		if ( ! paidNewsletterData?.steps[ step ] ) {
			stepContent = paidNewsletterData.steps;
		} else {
			stepContent = paidNewsletterData.steps[ step ]?.content ?? {};
		}

		stepStatus = paidNewsletterData?.steps[ step ]?.status;
	}

	useEffect( () => {
		if ( urlData?.platform === engine ) {
			if ( selectedSite && step === stepSlugs[ 0 ] && validFromSite === false ) {
				resetPaidNewsletter( selectedSite.ID, engine, stepSlugs[ 0 ] );
			}

			setValidFromSite( true );
		}
	}, [ urlData, fromSite, engine, selectedSite, resetPaidNewsletter, step, validFromSite ] );

	const currentStepSlug = stepSlugs[ stepIndex ];
	const stepsProgress = getSetpProgressSteps(
		engine,
		selectedSite?.slug || '',
		fromSite,
		paidNewsletterData
	);
	const stepUrl = `/import/newsletter/${ engine }/${ siteSlug }/${ currentStepSlug }`;
	const nextStepUrl = addQueryArgs( `/import/newsletter/${ engine }/${ siteSlug }/${ nextStep }`, {
		from: fromSite,
	} );

	const Step = steps[ stepIndex ];

	return (
		<div
			className={ clsx( 'newsletter-importer', 'newsletter-importer__step-' + currentStepSlug ) }
		>
			<LogoChain logos={ logoChainLogos } />

			<FormattedHeader headerText={ getTitle( urlData ) } />
			{ ( ! validFromSite || isResetPaidNewsletterPending ) && (
				<SelectNewsletterForm
					stepUrl={ stepUrl }
					urlData={ urlData }
					isLoading={ isFetching || isResetPaidNewsletterPending }
				/>
			) }

			{ validFromSite && ! isResetPaidNewsletterPending && (
				<StepProgress steps={ stepsProgress } currentStep={ stepIndex } />
			) }

			{ selectedSite && validFromSite && ! isResetPaidNewsletterPending && (
				<Step
					siteSlug={ siteSlug }
					nextStepUrl={ nextStepUrl }
					selectedSite={ selectedSite }
					fromSite={ fromSite }
					skipNextStep={ () => {
						skipNextStep( selectedSite.ID, engine, nextStep, step );
					} }
					cardData={ stepContent }
					engine={ engine }
					status={ stepStatus }
					isFetchingContent={ isFetchingPaidNewsletter }
					setAutoFetchData={ setAutoFetchData }
				/>
			) }
		</div>
	);
}
