import { createInterpolateElement } from '@wordpress/element';
import { people } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import {
	SubscribersStepContent,
	StepStatus,
} from 'calypso/data/paid-newsletter/use-paid-newsletter-query';
import SummaryStat from './SummaryStat';

interface SubscriberSummaryProps {
	stepContent: SubscribersStepContent;
	status: StepStatus;
}

export default function SubscriberSummary( { stepContent, status }: SubscriberSummaryProps ) {
	const { __ } = useI18n();
	if ( status === 'skipped' ) {
		return (
			<p>
				<SummaryStat
					icon={ people }
					label={ createInterpolateElement(
						__( 'You <strong>skipped</strong> subscriber importing.' ),
						{
							strong: <strong />,
						}
					) }
				/>
			</p>
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
					<SummaryStat
						count={ subscribedCount }
						icon={ people }
						label={ __( 'Total Subscribers' ) }
					/>
				) }
				{ addedFree > 0 && <SummaryStat count={ addedFree } label={ __( 'Free Subscribers' ) } /> }
				{ addedPaid > 0 && <SummaryStat count={ addedPaid } label={ __( 'Paid Subscribers' ) } /> }
				{ existingTotal > 0 && (
					<SummaryStat count={ existingTotal } label={ __( 'Skipped (duplicate)' ) } />
				) }
				{ failedTotal > 0 && <SummaryStat count={ failedTotal } label={ __( 'Not imported' ) } /> }
			</div>
		);
	}

	return null;
}
