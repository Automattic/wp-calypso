import { addQueryArgs, getQueryArg } from '@wordpress/url';
import FormattedHeader from 'calypso/components/formatted-header';
import StepProgress from 'calypso/components/step-progress';
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

export default function NewsletterImporter( { siteSlug, engine, step }: NewsletterImporterProps ) {
	const selectedSite = useSelector( getSelectedSite ) ?? undefined;

	const stepsProgress = [ 'Content', 'Subscribers', 'Paid Subscribers', 'Summary' ];

	let stepIndex = 0;
	let nextStep = stepSlugs[ 0 ];
	stepSlugs.forEach( ( stepName, index ) => {
		if ( stepName === step ) {
			stepIndex = index;
			nextStep = stepSlugs[ index + 1 ] ? stepSlugs[ index + 1 ] : stepSlugs[ index ];
		}
	} );
	const newsletterUrl = getQueryArg( window.location.href, 'newsletter' ) ?? null;
	const nextStepUrl = addQueryArgs( `/import/newsletter/${ engine }/${ siteSlug }/${ nextStep }`, {
		newsletter: newsletterUrl,
	} );
	const Step = steps[ stepIndex ] || steps[ 0 ];
	return (
		<div className="newsletter-importer">
			<LogoChain
				logos={ [
					{ name: 'substack', color: 'var(--color-substack)' },
					{ name: 'wordpress', color: '#3858E9' },
				] }
			/>

			<FormattedHeader headerText="Import your newsletter" />
			{ ( ! step || ! newsletterUrl ) && <SelectNewsletterForm nextStepUrl={ nextStepUrl } /> }
			{ step && <StepProgress steps={ stepsProgress } currentStep={ stepIndex } /> }
			{ step && newsletterUrl && (
				<Step
					siteSlug={ siteSlug }
					nextStepUrl={ nextStepUrl }
					selectedSite={ selectedSite }
					newsletterUrl={ newsletterUrl }
				/>
			) }
		</div>
	);
}
