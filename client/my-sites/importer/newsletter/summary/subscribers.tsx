import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { people } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import {
	CompSkipReason,
	SubscribersStepContent,
	StepStatus,
} from 'calypso/data/paid-newsletter/use-paid-newsletter-query';
import { SummaryStat } from '../components';

interface SubscriberSummaryProps {
	stepContent: SubscribersStepContent;
	status: StepStatus;
}

export default function SubscriberSummary( { stepContent, status }: SubscriberSummaryProps ) {
	const { __, _n } = useI18n();

	/**
	 * Comped subscribers still arrive, as free subscribers, so say what happened to the
	 * complimentary access rather than implying the people were lost.
	 * @param reason Why the server could not grant the comps.
	 * @param count  How many comped subscribers the file carried.
	 */
	function getCompSkipMessage( reason: CompSkipReason, count: number ) {
		const importedAsFree = sprintf(
			// Translators: %d is number of complimentary subscribers
			_n(
				'%d comped subscriber was imported as a free subscriber.',
				'%d comped subscribers were imported as free subscribers.',
				count
			),
			count
		);

		switch ( reason ) {
			case 'no_tier':
				return `${ importedAsFree } ${ __( 'There was no paid tier to grant against.' ) }`;
			case 'multiple_tiers':
				return `${ importedAsFree } ${ __( 'No tier was chosen to grant against.' ) }`;
			case 'chosen_tier_gone':
				return `${ importedAsFree } ${ __( 'The chosen tier no longer exists.' ) }`;
		}
	}

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
		const compCount = stepContent.meta?.comp_count ?? 0;
		const addedComp = parseInt( stepContent.meta?.comp_subscribed_count || '0' );
		const existingTotal =
			parseInt( stepContent.meta?.already_subscribed_count || '0' ) +
			parseInt( stepContent.meta?.paid_already_subscribed_count || '0' ) +
			parseInt( stepContent.meta?.comp_already_subscribed_count || '0' );
		const failedTotal =
			parseInt( stepContent.meta?.failed_subscribed_count || '0' ) +
			parseInt( stepContent.meta?.paid_failed_subscribed_count || '0' ) +
			parseInt( stepContent.meta?.comp_failed_subscribed_count || '0' );

		const compSkipReason = stepContent.meta?.comp_skip_reason;

		return (
			<>
				<div className="summary__content-stats">
					{ subscribedCount > 0 && (
						<SummaryStat
							count={ subscribedCount }
							icon={ people }
							label={ __( 'Total Subscribers' ) }
						/>
					) }
					{ addedFree > 0 && (
						<SummaryStat count={ addedFree } label={ __( 'Free Subscribers' ) } />
					) }
					{ addedPaid > 0 && (
						<SummaryStat count={ addedPaid } label={ __( 'Paid Subscribers' ) } />
					) }
					{ compCount > 0 && (
						<SummaryStat count={ addedComp } label={ __( 'Comped Subscribers' ) } />
					) }
					{ existingTotal > 0 && (
						<SummaryStat count={ existingTotal } label={ __( 'Skipped (duplicate)' ) } />
					) }
					{ failedTotal > 0 && (
						<SummaryStat count={ failedTotal } label={ __( 'Not imported' ) } />
					) }
				</div>
				{ compCount > 0 && compSkipReason && (
					<p className="summary__comp-skip-reason">
						{ getCompSkipMessage( compSkipReason, compCount ) }
					</p>
				) }
			</>
		);
	}

	return null;
}
