import { Card, ConfettiAnimation } from '@automattic/components';
import { SiteDetails } from '@automattic/data-stores';
import { Steps, StepStatus } from 'calypso/data/paid-newsletter/use-paid-newsletter-query';
import ImporterActionButton from '../importer-action-buttons/action-button';
import ImporterActionButtonContainer from '../importer-action-buttons/container';
import ContentSummary from './summary/content';
import SubscribersSummary from './summary/subscribers';

function getImporterStatus(
	contentStepStatus: StepStatus,
	subscribersStepStatus: StepStatus
): StepStatus {
	if ( contentStepStatus === 'done' && subscribersStepStatus === 'done' ) {
		return 'done';
	}

	if ( contentStepStatus === 'done' && subscribersStepStatus === 'skipped' ) {
		return 'done';
	}

	if ( contentStepStatus === 'skipped' && subscribersStepStatus === 'done' ) {
		return 'done';
	}

	if ( contentStepStatus === 'skipped' && subscribersStepStatus === 'skipped' ) {
		return 'skipped';
	}

	if ( contentStepStatus === 'importing' || subscribersStepStatus === 'importing' ) {
		return 'importing';
	}

	return 'initial';
}

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
}

export default function Summary( { steps, selectedSite }: SummaryProps ) {
	const prefersReducedMotion = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;
	const importerStatus = getImporterStatus( steps.content.status, steps.subscribers.status );

	return (
		<Card>
			{ importerStatus === 'done' && <ConfettiAnimation trigger={ ! prefersReducedMotion } /> }
			<h2>{ getStepTitle( importerStatus ) }</h2>
			<ContentSummary cardData={ steps.content.content } status={ steps.content.status } />
			<SubscribersSummary
				cardData={ steps.subscribers.content }
				status={ steps.subscribers.status }
			/>
			<ImporterActionButtonContainer noSpacing>
				<ImporterActionButton href={ '/settings/newsletter/' + selectedSite.slug } primary>
					Customize your newsletter
				</ImporterActionButton>
				<ImporterActionButton href={ '/posts/' + selectedSite.slug }>
					View content
				</ImporterActionButton>
				<ImporterActionButton href={ '/subscribers/' + selectedSite.slug }>
					Check subscribers
				</ImporterActionButton>
			</ImporterActionButtonContainer>
		</Card>
	);
}
