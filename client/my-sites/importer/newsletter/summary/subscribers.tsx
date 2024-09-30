import { ProgressBar } from '@wordpress/components';
import { Icon, people, atSymbol, payment, info, warning } from '@wordpress/icons';
import { SubscribersStepContent } from 'calypso/data/paid-newsletter/use-paid-newsletter-query';

interface SubscriberSummaryProps {
	stepContent: SubscribersStepContent;
	status: string;
}

export default function SubscriberSummary( { stepContent, status }: SubscriberSummaryProps ) {
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
		const subscribedCount = parseInt( stepContent.meta?.email_count || '0' );
		const addedFree = parseInt( stepContent.meta?.subscribed_count || '0' );
		const existingFree = parseInt( stepContent.meta?.already_subscribed_count || '0' );
		const failedFree = parseInt( stepContent.meta?.failed_subscribed_count || '0' );

		const addedPaid = parseInt( stepContent.meta?.paid_subscribed_count || '0' );
		const existingPaid = parseInt( stepContent.meta?.paid_already_subscribed_count || '0' );
		const failedPaid = parseInt( stepContent.meta?.paid_failed_subscribed_count || '0' );

		return (
			<>
				<div className="summary__content">
					<p>
						<Icon icon={ atSymbol } /> We imported { subscribedCount } subscribers, where:
					</p>
				</div>
				<div className="summary__content summary__content-indent">
					{ !! addedFree && (
						<p>
							<Icon icon={ people } />
							<strong>{ addedFree }</strong> free subscribers.
						</p>
					) }
					{ !! addedPaid && (
						<p>
							<Icon icon={ payment } />
							<strong>{ addedPaid }</strong> paid subscribers added.
						</p>
					) }
					{ !! existingFree && (
						<p>
							<Icon icon={ info } />
							<strong>{ existingFree }</strong> existing subscribers.
						</p>
					) }
					{ !! existingPaid && (
						<p>
							<Icon icon={ info } />
							<strong>{ existingPaid }</strong> existing paid subscribers.
						</p>
					) }
					{ !! failedFree && (
						<p>
							<Icon icon={ warning } />
							<strong>{ failedFree }</strong> error in the email format.
						</p>
					) }
					{ !! failedPaid && (
						<p>
							<Icon icon={ warning } />
							<strong>{ failedPaid }</strong> error in the email format.
						</p>
					) }
				</div>
			</>
		);
	}
}
