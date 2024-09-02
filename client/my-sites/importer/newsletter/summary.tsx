import { Card, ConfettiAnimation } from '@automattic/components';
import ContentSummary from './summary/content';
import SubscribersSummary from './summary/subscribers';
import type { SiteDetails } from '@automattic/data-stores';

type Props = {
	cardData: any;
	selectedSite: SiteDetails;
};

export default function Summary( { cardData, selectedSite }: Props ) {
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
					<ConfettiAnimation trigger={ ! prefersReducedMotion } /> <h1>Success! 🎉</h1>
				</>
			) }
			<ContentSummary cardData={ cardData.content.content } status={ cardData.content.status } />
			<SubscribersSummary
				cardData={ cardData.subscribers.content }
				status={ cardData.subscribers.status }
				proStatus={ cardData[ 'paid-subscribers' ].status }
				siteId={ selectedSite.ID }
			/>
		</Card>
	);
}
