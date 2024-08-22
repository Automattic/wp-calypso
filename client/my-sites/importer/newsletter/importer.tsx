import { addQueryArgs, getQueryArg } from '@wordpress/url';
import { useState, useEffect } from 'react';
import { UrlData } from 'calypso/blocks/import/types';
import FormattedHeader from 'calypso/components/formatted-header';
import StepProgress from 'calypso/components/step-progress';
import { usePaidNewsletterQuery } from 'calypso/data/paid-newsletter/use-paid-newsletter-query';
import { useResetMutation } from 'calypso/data/paid-newsletter/use-reset-mutation';
import { useSkipNextStepMutation } from 'calypso/data/paid-newsletter/use-skip-next-step-mutation';
import { useAnalyzeUrlQuery } from 'calypso/data/site-profiler/use-analyze-url-query';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import Content from './content';
import { LogoChain } from './logo-chain';
import PaidSubscribers from './paid-subscribers';
import SelectNewsletterForm from './select-newsletter-form';
import Subscribers from './subscribers';
import Summary from './summary';

import './importer.scss';

const steps = [ Content, Subscribers, PaidSubscribers, Summary ];

const stepSlugs = [ 'content', 'subscribers', 'paid-subscribers', 'summary' ];

const logoChainLogos = [
	{ name: 'substack', color: 'var(--color-substack)' },
	{ name: 'wordpress', color: '#3858E9' },
];

type NewsletterImporterProps = {
	siteSlug: string;
	engine: string;
	step: string;
};

function getTitle( urlData?: UrlData ) {
	if ( urlData?.meta?.title ) {
		return `Import ${ urlData?.meta?.title }`;
	}

	return 'Import your newsletter';
}

export default function NewsletterImporter( { siteSlug, engine, step }: NewsletterImporterProps ) {
	const selectedSite = useSelector( getSelectedSite ) ?? undefined;

	const [ validFromSite, setValidFromSite ] = useState( false );

	const stepsProgress = [ 'Content', 'Subscribers', 'Paid Subscribers', 'Summary' ];

	let fromSite = getQueryArg( window.location.href, 'from' ) as string | string[];

	// Steps
	fromSite = Array.isArray( fromSite ) ? fromSite[ 0 ] : fromSite;
	if ( fromSite && ! step ) {
		step = stepSlugs[ 0 ];
	}

	let stepIndex = 0;
	let nextStep = stepSlugs[ 0 ];

	const { data: paidNewsletterData, isFetching: isFetchingPaidNewsletter } = usePaidNewsletterQuery(
		engine,
		step,
		selectedSite?.ID
	);

	stepSlugs.forEach( ( stepName, index ) => {
		if ( stepName === step ) {
			stepIndex = index;
			nextStep = stepSlugs[ index + 1 ] ? stepSlugs[ index + 1 ] : stepSlugs[ index ];
		}
		if ( ! isFetchingPaidNewsletter ) {
			const status = paidNewsletterData?.steps[ stepName ]?.status ?? '';
			stepsProgress[ index ] = stepsProgress[ index ] + ' (' + status + ')';
		}
	} );

	const { skipNextStep } = useSkipNextStepMutation();
	const { resetPaidNewsletter, isPending: isResetPaidNewsletterPending } = useResetMutation();

	const { data: urlData, isFetching } = useAnalyzeUrlQuery( fromSite );

	let stepContent = {};
	if ( paidNewsletterData?.steps ) {
		stepContent = paidNewsletterData?.steps[ step ]?.content ?? {};
	}

	useEffect( () => {
		if ( urlData?.platform === engine ) {
			if ( selectedSite && step === stepSlugs[ 0 ] && validFromSite === false ) {
				resetPaidNewsletter( selectedSite.ID, engine, stepSlugs[ 0 ] );
			}

			setValidFromSite( true );
		}
	}, [ urlData, fromSite, engine, selectedSite, resetPaidNewsletter, step, validFromSite ] );

	const stepUrl = `/import/newsletter/${ engine }/${ siteSlug }/${ stepSlugs[ stepIndex ] }`;
	const nextStepUrl = addQueryArgs( `/import/newsletter/${ engine }/${ siteSlug }/${ nextStep }`, {
		from: fromSite,
	} );

	const Step = steps[ stepIndex ] || steps[ 0 ];

	return (
		<div className="newsletter-importer">
			<LogoChain logos={ logoChainLogos } />

			<FormattedHeader headerText={ getTitle( urlData ) } />
			{ ( ! validFromSite || isResetPaidNewsletterPending ) && (
				<SelectNewsletterForm
					stepUrl={ stepUrl }
					urlData={ urlData }
					isLoading={ isFetching || isResetPaidNewsletterPending }
					validFromSite={ validFromSite }
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
					isFetchingContent={ isFetchingPaidNewsletter }
					content={ stepContent }
				/>
			) }
		</div>
	);
}
