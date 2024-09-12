import { Card, ConfettiAnimation } from '@automattic/components';
import { Steps, StepStatus } from 'calypso/data/paid-newsletter/use-paid-newsletter-query';
import ImporterActionButton from '../importer-action-buttons/action-button';
import ImporterActionButtonContainer from '../importer-action-buttons/container';
import ContentSummary from './summary/content';
import SubscribersSummary from './summary/subscribers';
import { StepProps } from './types';

function getImporterStatus( steps: Steps ): StepStatus {
	if ( steps.content.status === 'done' && steps.subscribers.status === 'done' ) {
		return 'done';
	}

	if ( steps.content.status === 'done' && steps.subscribers.status === 'skipped' ) {
		return 'done';
	}

	if ( steps.content.status === 'skipped' && steps.subscribers.status === 'done' ) {
		return 'done';
	}

	if ( steps.content.status === 'skipped' && steps.subscribers.status === 'skipped' ) {
		return 'skipped';
	}

	if ( steps.content.status === 'importing' || steps.subscribers.status === 'importing' ) {
		return 'importing';
	}

	return 'initial';
}

function getStepTitle( importerStatus: StepStatus ) {
	if ( importerStatus === 'done' ) {
		return 'Success! 🎉';
	}

	if ( importerStatus === 'importing' ) {
		return 'Still working!';
	}

	return 'Nothing to import';
}

export default function Summary( { cardData, selectedSite }: StepProps< Steps > ) {
	const prefersReducedMotion = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;
	const importerStatus = getImporterStatus( cardData );

	return (
		<Card>
			{ importerStatus === 'done' && <ConfettiAnimation trigger={ ! prefersReducedMotion } /> }
			<h2>{ getStepTitle( importerStatus ) }</h2>
			<ContentSummary cardData={ cardData.content.content } status={ cardData.content.status } />
			<SubscribersSummary
				cardData={ cardData.subscribers.content }
				status={ cardData.subscribers.status }
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
