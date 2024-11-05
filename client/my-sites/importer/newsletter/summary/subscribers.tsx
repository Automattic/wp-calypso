import { Tooltip } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
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
					<Icon icon={ atSymbol } />
					{ createInterpolateElement( __( 'You <strong>skipped</strong> subscriber importing.' ), {
						strong: <strong />,
					} ) }
				</p>
			</div>
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
			<dl className="summary__content-stats">
				{ subscribedCount > 0 && (
					<>
						<dt>
							<Icon icon={ people } /> { __( 'Total Subscribers' ) }
						</dt>
						<dd>{ subscribedCount }</dd>
					</>
				) }
				{ addedFree > 0 && (
					<>
						<dt className="summary__content-indent">{ __( 'Free subscribers' ) }</dt>
						<dd>{ addedFree }</dd>
					</>
				) }
				{ addedFree > 0 && (
					<>
						<dt className="summary__content-indent">{ __( 'Free subscribers' ) }</dt>
						<dd>{ addedFree }</dd>
					</>
				) }
				{ addedPaid > 0 && (
					<>
						<dt className="summary__content-indent">{ __( 'Paid subscribers' ) }</dt>
						<dd>{ addedPaid }</dd>
					</>
				) }
				{ existingTotal > 0 && (
					<>
						<dt className="summary__content-indent">{ __( 'Skipped (duplicate)' ) }</dt>
						<dd>{ existingTotal }</dd>
					</>
				) }
				{ failedTotal > 0 && (
					<>
						<dt className="summary__content-indent">
							{ __( 'Not imported' ) }
							<Tooltip>
								<Icon icon={ info } size={ 16 } />
							</Tooltip>
						</dt>
						<dd>{ failedTotal }</dd>
					</>
				) }
			</dl>
		);
	}

	return null;
}
