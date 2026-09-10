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
		const addedAsFree = sprintf(
			// Translators: %d is number of complimentary subscribers
			_n(
				'%d comped subscriber was added as a free subscriber.',
				'%d comped subscribers were added as free subscribers.',
				count
			),
			count
		);

		switch ( reason ) {
			case 'no_tier':
				return `${ addedAsFree } ${ __(
					'Set up a paid tier to give them complimentary access.'
				) }`;
			case 'multiple_tiers':
				return `${ addedAsFree } ${ __(
					'Your site has more than one paid tier, so we didn’t know which one to use.'
				) }`;
			case 'chosen_tier_gone':
				return `${ addedAsFree } ${ __( 'The paid tier you chose no longer exists.' ) }`;
			case 'tier_lookup_failed':
				return `${ addedAsFree } ${ __(
					'We couldn’t read your site’s paid tiers, so complimentary access wasn’t granted.'
				) }`;
			default:
				// A reason we do not have copy for yet still tells them where the people went.
				return addedAsFree;
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
		const compSkipReason = stepContent.meta?.comp_skip_reason;
		// Comps the server could not grant are counted as failed, but they still arrived as free
		// subscribers, so counting them here too would both double-count them and contradict the
		// explanation below.
		const compFailed = compSkipReason
			? 0
			: parseInt( stepContent.meta?.comp_failed_subscribed_count || '0' );
		const failedTotal =
			parseInt( stepContent.meta?.failed_subscribed_count || '0' ) +
			parseInt( stepContent.meta?.paid_failed_subscribed_count || '0' ) +
			compFailed;

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
					{ addedComp > 0 && (
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
