import { Icon, people, currencyDollar, atSymbol } from '@wordpress/icons';
import { SubscribersStepContent } from 'calypso/data/paid-newsletter/use-paid-newsletter-query';

interface SubscriberSummaryProps {
	stepContent: SubscribersStepContent;
	status: string;
}

export default function SubscriberSummary( { stepContent, status }: SubscriberSummaryProps ) {
	const paidSubscribers = parseInt( stepContent?.meta?.paid_subscribers_count || '0' );
	const hasPaidSubscribers = paidSubscribers > 0;

	if ( status === 'skipped' ) {
		return (
			<div className="summary__content">
				<p>
					<Icon icon={ atSymbol } /> You <strong>skipped</strong> subscriber importing.
				</p>
			</div>
		);
	}

	if ( status === 'importing' || status === 'pending' ) {
		return (
			<div className="summary__content">
				<p>
					<Icon icon={ people } /> <strong>We're importing your subscribers.</strong>
					<br />
					This may take a few minutes. Feel free to leave this window – we'll let you know when it's
					done.
				</p>
			</div>
		);
	}

	if ( status === 'done' ) {
		const paidSubscribersCount = parseInt( stepContent.meta?.paid_subscribers_count || '0' );
		const subscribedCount = parseInt( stepContent.meta?.subscribed_count || '0' );
		const freeSubscribersCount = subscribedCount - paidSubscribersCount;

		return (
			<div className="summary__content">
				<p>We migrated { subscribedCount } subscribers</p>
				<p>
					<Icon icon={ people } />
					<strong>{ freeSubscribersCount }</strong> free subscribers
				</p>
				{ hasPaidSubscribers && (
					<p>
						<Icon icon={ currencyDollar } />
						<strong>{ paidSubscribersCount }</strong> paid subscribers
					</p>
				) }
			</div>
		);
	}
}
