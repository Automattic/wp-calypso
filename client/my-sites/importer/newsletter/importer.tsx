import { addQueryArgs, getQueryArg } from '@wordpress/url';
import { useState, useEffect } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import StepProgress from 'calypso/components/step-progress';
import { usePaidNewsletterQuery } from 'calypso/data/paid-newsletter/use-paid-newsletter-query';
import { useSkipNextStepMutation } from 'calypso/data/paid-newsletter/use-skip-next-step-mutation';
import { useAnalyzeUrlQuery } from 'calypso/data/site-profiler/use-analyze-url-query';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import ImporterLogo from '../importer-logo';
import Content from './content';
import PaidSubscribers from './paid-subscribers';
import SelectNewsletterForm from './select-newsletter-form';
import Subscribers from './subscribers';
import Summary from './summary';

import './importer.scss';

type Logo = {
	name: string;
	color: string;
};
type LogoChainProps = {
	logos: Logo[];
};
function LogoChain( { logos }: LogoChainProps ) {
	return (
		<div className="logo-chain">
			{ logos.map( ( logo ) => (
				<div key={ logo.name } className="logo-chain__logo" style={ { background: logo.color } }>
					<ImporterLogo key={ logo.name } icon={ logo.name } />
				</div>
			) ) }
		</div>
	);
}

const steps = [ Content, Subscribers, PaidSubscribers, Summary ];

const stepSlugs = [ 'content', 'subscribers', 'paid-subscribers', 'summary' ];

type NewsletterImporterProps = {
	siteSlug: string;
	engine: string;
	step: string;
};

function getTitle( urlData: any ) {
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

	const { data: paidNewsletterQuery, isFetching: isFetchingPaidNewsletter } =
		usePaidNewsletterQuery( engine, step, selectedSite?.ID );

	stepSlugs.forEach( ( stepName, index ) => {
		if ( stepName === step ) {
			stepIndex = index;
			nextStep = stepSlugs[ index + 1 ] ? stepSlugs[ index + 1 ] : stepSlugs[ index ];
		}
		if ( ! isFetchingPaidNewsletter ) {
			const status = paidNewsletterQuery?.steps[ stepName ]?.status ?? '';
			stepsProgress[ index ] = stepsProgress[ index ] + ' (' + status + ')';
		}
	} );

	const { skipNextStep } = useSkipNextStepMutation();

	const { data: urlData, isFetching } = useAnalyzeUrlQuery( fromSite );

	useEffect( () => {
		if ( urlData?.platform === engine ) {
			setValidFromSite( true );
		}
	}, [ urlData, fromSite, engine ] );

	const stepUrl = `/import/newsletter/${ engine }/${ siteSlug }/${ stepSlugs[ stepIndex ] }`;
	const nextStepUrl = addQueryArgs( `/import/newsletter/${ engine }/${ siteSlug }/${ nextStep }`, {
		from: fromSite,
	} );

	const Step = steps[ stepIndex ] || steps[ 0 ];

	let stepContent = {};
	if ( ! isFetchingPaidNewsletter ) {
		stepContent = paidNewsletterQuery?.steps[ step ]?.content ?? {};
	}

	return (
		<div className="newsletter-importer">
			<LogoChain
				logos={ [
					{ name: 'substack', color: 'var(--color-substack)' },
					{ name: 'wordpress', color: '#3858E9' },
				] }
			/>
			<FormattedHeader headerText={ getTitle( urlData ) } />
			{ ! validFromSite && (
				<SelectNewsletterForm
					stepUrl={ stepUrl }
					urlData={ urlData }
					isLoading={ isFetching }
					validFromSite={ validFromSite }
				/>
			) }
			{ validFromSite && <StepProgress steps={ stepsProgress } currentStep={ stepIndex } /> }
			{ selectedSite && validFromSite && (
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
