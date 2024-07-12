import FormattedHeader from 'calypso/components/formatted-header';
import StepProgress from 'calypso/components/step-progress';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import ImporterLogo from '../importer-logo';
import Content from './content';
import PaidSubscribers from './paid-subscribers';
import Subscribers from './subscribers';
import Summary from './summary';

import './importer.scss';

function LogoChain( { logos } ) {
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

export default function NewsletterImporter( { siteSlug, engine, step } ) {

	const selectedSite = useSelector( getSelectedSite );

	const stepsProgress = [
		'Content',
		'Subscribers',
		'Paid Subscribers',
		'Summary',
	];

	let stepIndex = 0;
	let nextStep = stepSlugs[ 1 ];
	stepSlugs.forEach( ( stepName, index ) => {
		if ( stepName === step ) {
			stepIndex = index;
			nextStep = stepSlugs[ index + 1 ] ? stepSlugs[ index + 1 ] : stepSlugs[ index ];
		}
	} );

	const nextStepUrl = `/import/newsletter/${ engine }/${ siteSlug }/${ nextStep }`;

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
			<StepProgress steps={ stepsProgress } currentStep={ stepIndex } />
			<Step siteSlug={ siteSlug } nextStepUrl={ nextStepUrl } selectedSite={ selectedSite } />
		</div>
	);
}
