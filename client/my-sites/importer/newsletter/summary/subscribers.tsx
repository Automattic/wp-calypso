import { ProgressBar } from '@wordpress/components';
import { Icon, people, atSymbol, info } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { SubscribersStepContent } from 'calypso/data/paid-newsletter/use-paid-newsletter-query';

interface SubscriberSummaryProps {
	stepContent: SubscribersStepContent;
	status: string;
}

export default function SubscriberSummary( { stepContent, status }: SubscriberSummaryProps ) {
	const { __ } = useI18n();
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
						<Icon icon={ atSymbol } />{ ' ' }
						<strong>{ __( "We're importing your subscribers." ) }</strong>
						<br />
					</p>
				</div>
				<p>
					{ __(
						"This may take a few minutes. Feel free to leave this window – we'll let you know when it's done."
					) }
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
		const addedPaid = parseInt( stepContent.meta?.paid_subscribed_count || '0' );
		const existingTotal =
			parseInt( stepContent.meta?.already_subscribed_count || '0' ) +
			parseInt( stepContent.meta?.paid_already_subscribed_count || '0' );
		const failedTotal =
			parseInt( stepContent.meta?.failed_subscribed_count || '0' ) +
			parseInt( stepContent.meta?.paid_failed_subscribed_count || '0' );

		return (
			<div className="summary__content-stats">
				{ subscribedCount > 0 && (
					<div className="summary__content-stat-item">
						<Icon icon={ people } />
						<span>{ __( 'Total Subscribers' ) }</span>
						<strong>{ subscribedCount }</strong>
					</div>
				) }

				{ addedFree > 0 && (
					<div className="summary__content-stat-item summary__content-stat-item-indent">
						<span>{ __( 'Free subscribers' ) }</span>
						<strong>{ addedFree }</strong>
					</div>
				) }

				{ addedPaid > 0 && (
					<div className="summary__content-stat-item summary__content-stat-item-indent">
						<span>{ __( 'Paid subscribers' ) }</span>
						<strong>{ addedPaid }</strong>
					</div>
				) }

				{ existingTotal > 0 && (
					<div className="summary__content-stat-item summary__content-stat-item-indent">
						<span>{ __( 'Skipped (Duplicate)' ) }</span>
						<strong>{ existingTotal }</strong>
					</div>
				) }

				{ failedTotal > 0 && (
					<div className="summary__content-stat-item summary__content-stat-item-indent">
						<span>{ __( 'Not imported' ) }</span>
						<Icon icon={ info } className="info-icon" />
						<strong>{ failedTotal }</strong>
					</div>
				) }
			</div>
		);
	}
}
