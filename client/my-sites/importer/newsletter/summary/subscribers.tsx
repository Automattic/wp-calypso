import { ProgressBar } from '@wordpress/components';
import { Icon, people, atSymbol, payment } from '@wordpress/icons';
import { SubscribersStepContent } from 'calypso/data/paid-newsletter/use-paid-newsletter-query';

interface SubscriberSummaryProps {
	stepContent: SubscribersStepContent;
	status: string;
}

export default function SubscriberSummary( { stepContent, status }: SubscriberSummaryProps ) {
	const paidSubscribersCount = parseInt( stepContent?.meta?.paid_subscribers_count || '0' );
	const hasPaidSubscribers = paidSubscribersCount > 0;

	if ( status === 'skipped' ) {
		return (
			<div className="summary__content">
				<p>
					<Icon icon={ atSymbol } /> You <strong>skipped</strong> subscriber importing.
				</p>
			</div>
		);
	}

	if ( status === 'importing' ) {
		return (
			<>
				<div className="summary__content">
					<p>
						<Icon icon={ atSymbol } /> <strong>We're importing your subscribers.</strong>
						<br />
					</p>
				</div>
				<p>
					This may take a few minutes. Feel free to leave this window – we'll let you know when it's
					done.
				</p>
				<p>
					<ProgressBar className="is-larger-progress-bar" />
				</p>
			</>
		);
	}

	if ( status === 'done' ) {
		const subscribedCount = parseInt( stepContent.meta?.subscribed_count || '0' );
		const freeSubscribersCount = subscribedCount - paidSubscribersCount;

		return (
			<>
				<div className="summary__content">
					<p>
						<Icon icon={ atSymbol } /> We imported { subscribedCount } subscribers, where:
					</p>
				</div>
				<div className="summary__content summary__content-indent">
					<p>
						<Icon icon={ people } />
						<strong>{ freeSubscribersCount }</strong> free subscribers
					</p>
					{ hasPaidSubscribers && (
						<p>
							<Icon icon={ payment } />
							<strong>{ paidSubscribersCount }</strong> paid subscribers
						</p>
					) }
				</div>
			</>
		);
	}
}
