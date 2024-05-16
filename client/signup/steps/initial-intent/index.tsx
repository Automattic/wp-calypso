import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import StepWrapper from 'calypso/signup/step-wrapper';

interface Props {
	stepName: string;
	goToNextStep: () => void;
}

export default function InitialIntentStep( props: Props ) {
	const translate = useTranslate();
	const headerText = translate( 'What brings you to WordPress.com?' );
	const subHeaderText = translate(
		'This will help us tailor your onboarding experience to your needs.'
	);

	return (
		<StepWrapper
			headerText={ headerText }
			fallbackHeaderText={ headerText }
			subHeaderText={ subHeaderText }
			fallbackSubHeaderText={ subHeaderText }
			stepContent={
				<>
					<Card tagName="button" displayAsLink onClick={ () => {} }>
						<strong>{ translate( 'Creating a site for myself, a business, or a friend' ) }</strong>
						<p>{ translate( 'Everything you need to build a website and grow your audience.' ) }</p>
					</Card>
					<Card tagName="button" displayAsLink onClick={ () => {} }>
						<strong>{ translate( 'Creating a site for a client' ) }</strong>
						<p>
							{ translate(
								'Ideal for freelancers, agencies or developers seeking to manage one or more sites.'
							) }
						</p>
					</Card>
					<Card tagName="button" displayAsLink onClick={ () => {} }>
						<strong>{ translate( 'Migrating or importing an existing site' ) }</strong>
						<p>
							{ translate(
								'Bring your site from another platform just by following few simple steps.'
							) }
						</p>
					</Card>
				</>
			}
			align="center"
			hideSkip
			{ ...props }
		/>
	);
}
