import { Card, ConfettiAnimation } from '@automattic/components';
import { Dispatch, SetStateAction, useEffect } from 'react';
import ContentSummary from './summary/content';
import SubscribersSummary from './summary/subscribers';
import type { SiteDetails } from '@automattic/data-stores';

type Props = {
	cardData: any;
	selectedSite: SiteDetails;
	setAutoFetchData: Dispatch< SetStateAction< boolean > >;
};

export default function Summary( { cardData, selectedSite, setAutoFetchData }: Props ) {
	const prefersReducedMotion = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;
	useEffect( () => {
		if ( cardData.content.status === 'importing' || cardData.subscribers.status === 'importing' ) {
			setAutoFetchData( true );
		} else {
			setAutoFetchData( false );
		}
	}, [ cardData.content.status, cardData.subscribers.status, setAutoFetchData ] );

	function shouldRenderConfetti( contentStatus: string, subscriberStatue: string ) {
		if ( contentStatus === 'done' && subscriberStatue === 'imported' ) {
			return true;
		}
		if ( contentStatus === 'done' && subscriberStatue === 'skipped' ) {
			return true;
		}

		if ( contentStatus === 'skipped' && subscriberStatue === 'imported' ) {
			return true;
		}

		return false;
	}
	return (
		<Card>
			{ shouldRenderConfetti( cardData.content.status, cardData.subscribers.status ) && (
				<ConfettiAnimation trigger={ ! prefersReducedMotion } />
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
