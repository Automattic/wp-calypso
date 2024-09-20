import { Card, ConfettiAnimation } from '@automattic/components';
import { SiteDetails } from '@automattic/data-stores';
import { Steps, StepStatus } from 'calypso/data/paid-newsletter/use-paid-newsletter-query';
import { useResetMutation } from 'calypso/data/paid-newsletter/use-reset-mutation';
import ImporterActionButton from '../importer-action-buttons/action-button';
import ImporterActionButtonContainer from '../importer-action-buttons/container';
import ContentSummary from './summary/content';
import SubscribersSummary from './summary/subscribers';
import { EngineTypes } from './types';
import { getImporterStatus } from './utils';

function getStepTitle( importerStatus: StepStatus ) {
	if ( importerStatus === 'done' ) {
		return 'Success! 🎉';
	}

	if ( importerStatus === 'importing' ) {
		return 'Almost there…';
	}

	return 'Summary';
}

interface SummaryProps {
	selectedSite: SiteDetails;
	steps: Steps;
	engine: EngineTypes;
}

export default function Summary( { steps, selectedSite, engine }: SummaryProps ) {
	const { resetPaidNewsletter } = useResetMutation();
	const prefersReducedMotion = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;
	const importerStatus = getImporterStatus( steps.content.status, steps.subscribers.status );

	const onButtonClick = () => resetPaidNewsletter( selectedSite.ID, engine, 'content' );

	return (
		<Card>
			{ importerStatus === 'done' && <ConfettiAnimation trigger={ ! prefersReducedMotion } /> }
			<h2>{ getStepTitle( importerStatus ) }</h2>
			{ steps.content.content && (
				<ContentSummary stepContent={ steps.content.content } status={ steps.content.status } />
			) }
			{ steps.subscribers.content && (
				<SubscribersSummary
					stepContent={ steps.subscribers.content }
					status={ steps.subscribers.status }
				/>
			) }

			<ImporterActionButtonContainer noSpacing>
				<ImporterActionButton
					href={ '/settings/newsletter/' + selectedSite.slug }
					onClick={ onButtonClick }
					primary
				>
					Customize your newsletter
				</ImporterActionButton>
				<ImporterActionButton href={ '/posts/' + selectedSite.slug } onClick={ onButtonClick }>
					View content
				</ImporterActionButton>
				<ImporterActionButton
					href={ '/subscribers/' + selectedSite.slug }
					onClick={ onButtonClick }
				>
					Check subscribers
				</ImporterActionButton>
			</ImporterActionButtonContainer>
		</Card>
	);
}
