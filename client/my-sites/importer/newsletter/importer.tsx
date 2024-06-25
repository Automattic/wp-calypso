import { useTranslate } from 'i18n-calypso';
import FormattedHeader from 'calypso/components/formatted-header';
import StepProgress from 'calypso/components/step-progress';
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
				<div className="logo-chain__logo" style={ { background: logo.color } }>
					<ImporterLogo key={ logo.name } icon={ logo.name } />
				</div>
			) ) }
		</div>
	);
}

const steps = [ Content, Subscribers, PaidSubscribers, Summary ];

const stepSlugs = [ 'content', 'subscribers', 'paid-subscribers', 'summary' ];

export default function NewsletterImporter( { siteSlug, engine, step } ) {
	const translate = useTranslate();

	const stepsProgress = [
		translate( 'Content' ),
		translate( 'Subscribers' ),
		translate( 'Paid Subscribers' ),
		translate( 'Summary' ),
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
			<Step siteSlug nextStepUrl={ nextStepUrl } />
		</div>
	);
}
