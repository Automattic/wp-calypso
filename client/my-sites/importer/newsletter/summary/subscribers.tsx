import { ProgressBar } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { Icon, people, info, payment, atSymbol } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { SubscribersStepContent } from 'calypso/data/paid-newsletter/use-paid-newsletter-query';

interface SubscriberSummaryProps {
	stepContent: SubscribersStepContent;
	status: string;
}

export default function SubscriberSummary( { stepContent, status }: SubscriberSummaryProps ) {
	const { __, _n } = useI18n();
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
		const existingFree = parseInt( stepContent.meta?.already_subscribed_count || '0' );
		const failedFree = parseInt( stepContent.meta?.failed_subscribed_count || '0' );

		const addedPaid = parseInt( stepContent.meta?.paid_subscribed_count || '0' );
		const existingPaid = parseInt( stepContent.meta?.paid_already_subscribed_count || '0' );
		const failedPaid = parseInt( stepContent.meta?.paid_failed_subscribed_count || '0' );

		return (
			<>
				<div className="summary__content">
					<p>
						<Icon icon={ atSymbol } />{ ' ' }
						{ sprintf(
							// translators: %d is the subscriber count
							_n( '%d subscriber, where:', '%d subscribers, where:', subscribedCount ),
							subscribedCount
						) }
					</p>
				</div>
				<div className="summary__content summary__content-indent">
					{ !! addedFree && (
						<p>
							<Icon icon={ people } />
							{ createInterpolateElement(
								sprintf(
									// translators: %d is the subscriber count
									_n(
										'<strong>%d</strong> is free subscriber',
										'<strong>%d</strong> are free subscribers',
										addedFree
									),
									addedFree
								),
								{
									strong: <strong />,
								}
							) }
						</p>
					) }
					{ !! addedPaid && (
						<p>
							<Icon icon={ payment } />
							{ createInterpolateElement(
								sprintf(
									// translators: %d is the subscriber count
									_n(
										'<strong>%d</strong> is paid subscriber',
										'<strong>%d</strong> are paid subscribers',
										addedPaid
									),
									addedPaid
								),
								{
									strong: <strong />,
								}
							) }
						</p>
					) }
					{ !! existingFree && (
						<p>
							<Icon icon={ people } />
							{ createInterpolateElement(
								sprintf(
									// translators: %d is the subscriber count
									_n(
										'<strong>%d</strong> is existing free subscriber',
										'<strong>%d</strong> are existing free subscribers',
										existingFree
									),
									existingFree
								),
								{
									strong: <strong />,
								}
							) }
						</p>
					) }
					{ !! existingPaid && (
						<p>
							<Icon icon={ payment } />
							{ createInterpolateElement(
								sprintf(
									// translators: %d is the subscriber count
									_n(
										'<strong>%d</strong> is existing paid subscriber',
										'<strong>%d</strong> are existing paid subscribers',
										existingPaid
									),
									existingPaid
								),
								{
									strong: <strong />,
								}
							) }
						</p>
					) }
					{ !! failedFree && (
						<p>
							<Icon icon={ info } />
							{ createInterpolateElement(
								sprintf(
									// translators: %d is the subscriber count
									_n(
										'<strong>%d</strong> free subscriber was not imported because they had error in the email format',
										'<strong>%d</strong> free subscribers were not imported because they had error in the email format',
										failedFree
									),
									failedFree
								),
								{
									strong: <strong />,
								}
							) }
						</p>
					) }
					{ !! failedPaid && (
						<p>
							<Icon icon={ info } />
							{ createInterpolateElement(
								sprintf(
									// translators: %d is the subscriber count
									_n(
										'<strong>%d</strong> paid subscriber was not imported because they had error in the email format',
										'<strong>%d</strong> paid subscribers were not imported because they had error in the email format',
										failedFree
									),
									failedFree
								),
								{
									strong: <strong />,
								}
							) }
						</p>
					) }
				</div>
			</>
		);
	}
}
