import page from '@automattic/calypso-router';
import { Spinner } from '@wordpress/components';
import { Icon, check } from '@wordpress/icons';
import { addQueryArgs, getQueryArg } from '@wordpress/url';
import { useState, useEffect } from 'react';
import { UrlData } from 'calypso/blocks/import/types';
import FormattedHeader from 'calypso/components/formatted-header';
import StepProgress, { ClickHandler } from 'calypso/components/step-progress';
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
import { LogoChain } from './logo-chain';
import PaidSubscribers from './paid-subscribers';
import SelectNewsletterForm from './select-newsletter-form';
import Subscribers from './subscribers';
import Summary from './summary';

import './importer.scss';

const steps = [ Content, Subscribers, PaidSubscribers, Summary ];

const stepSlugs: StepId[] = [ 'content', 'subscribers', 'paid-subscribers', 'summary' ];

const logoChainLogos = [
	{ name: 'substack', color: 'var(--color-substack)' },
	{ name: 'wordpress', color: '#3858E9' },
];

type NewsletterImporterProps = {
	siteSlug: string;
	engine: string;
	step: StepId;
};

function getTitle( urlData?: UrlData ) {
	if ( urlData?.meta?.title ) {
		return `Import ${ urlData?.meta?.title }`;
	}

	return 'Import your newsletter';
}

export default function NewsletterImporter( { siteSlug, engine, step }: NewsletterImporterProps ) {
	let fromSite = getQueryArg( window.location.href, 'from' ) as string | string[];
	const selectedSite = useSelector( getSelectedSite ) ?? undefined;

	const [ validFromSite, setValidFromSite ] = useState( false );
	const [ autoFetchData, setAutoFetchData ] = useState( false );

	const stepsProgress: ClickHandler[] = [
		{
			message: 'Content',
			onClick: () => {
				page(
					addQueryArgs( `/import/newsletter/${ engine }/${ siteSlug }/content`, {
						from: fromSite,
					} )
				);
			},
			show: 'onComplete',
		},
		{
			message: 'Subscribers',
			onClick: () => {
				page(
					addQueryArgs( `/import/newsletter/${ engine }/${ siteSlug }/subscribers`, {
						from: fromSite,
					} )
				);
			},
			show: 'onComplete',
		},
		{
			message: 'Paid Subscribers',
			onClick: () => {
				page(
					addQueryArgs( `/import/newsletter/${ engine }/${ siteSlug }/paid-subscribers`, {
						from: fromSite,
					} )
				);
			},
			show: 'onComplete',
		},
		{ message: 'Summary', onClick: () => {} },
	];

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
		paidNewsletterData?.steps.subscribers?.status,
		setAutoFetchData,
	] );

	stepSlugs.forEach( ( stepName, index ) => {
		if ( stepName === step ) {
			stepIndex = index;
			nextStep = stepSlugs[ index + 1 ] ? stepSlugs[ index + 1 ] : stepSlugs[ index ];
		}

		if ( paidNewsletterData?.steps ) {
			const status = paidNewsletterData?.steps[ stepName ]?.status ?? '';
			if ( status === 'done' ) {
				stepsProgress[ index ].indicator = <Icon icon={ check } />;
			}
			if ( status === 'importing' ) {
				stepsProgress[ index ].indicator = <Spinner style={ { color: '#3858e9' } } />;
			}
		}
	} );

	const { skipNextStep } = useSkipNextStepMutation();
	const { resetPaidNewsletter, isPending: isResetPaidNewsletterPending } = useResetMutation();

	const { data: urlData, isFetching } = useAnalyzeUrlQuery( fromSite );

	let stepContent = {};
	if ( paidNewsletterData?.steps ) {
		// This is useful for the summary step.
		if ( ! paidNewsletterData?.steps[ step ] ) {
			stepContent = paidNewsletterData.steps;
		} else {
			stepContent = paidNewsletterData.steps[ step ]?.content ?? {};
		}
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
					// FIXME
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-expect-error
					cardData={ stepContent }
					engine={ engine }
					isFetchingContent={ isFetchingPaidNewsletter }
				/>
			) }
		</div>
	);
}
