import { Card, ConfettiAnimation } from '@automattic/components';
import ImporterActionButton from '../importer-action-buttons/action-button';
import ImporterActionButtonContainer from '../importer-action-buttons/container';
import ContentSummary from './summary/content';
import SubscribersSummary from './summary/subscribers';
import { StepProps } from './types';

export default function Summary( { cardData, selectedSite }: StepProps ) {
	const prefersReducedMotion = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

	function shouldRenderConfetti( contentStatus: string, subscriberStatue: string ) {
		if ( contentStatus === 'done' && subscriberStatue === 'done' ) {
			return true;
		}

		if ( contentStatus === 'done' && subscriberStatue === 'skipped' ) {
			return true;
		}

		if ( contentStatus === 'skipped' && subscriberStatue === 'done' ) {
			return true;
		}

		return false;
	}

	return (
		<Card>
			{ shouldRenderConfetti( cardData.content.status, cardData.subscribers.status ) && (
				<>
					<ConfettiAnimation trigger={ ! prefersReducedMotion } />
					<h2>Success! 🎉</h2>
				</>
			) }
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
					View imported content
				</ImporterActionButton>
				<ImporterActionButton href={ '/subscribers/' + selectedSite.slug }>
					Check subscribers
				</ImporterActionButton>
			</ImporterActionButtonContainer>
		</Card>
	);
}
