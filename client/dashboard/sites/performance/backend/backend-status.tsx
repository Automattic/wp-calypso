import { __, sprintf } from '@wordpress/i18n';
import { Notice } from '../../../components/notice';
import { BACKEND_THRESHOLDS_MS, bucketByMs, formatMs } from './utils';

export default function BackendStatusNotice( { avgResponseMs }: { avgResponseMs: number } ) {
	const intent = bucketByMs( avgResponseMs, BACKEND_THRESHOLDS_MS.response );
	const formatted = formatMs( avgResponseMs );

	if ( intent === 'error' ) {
		return (
			<Notice
				variant="error"
				title={ sprintf(
					/* translators: %s is the average response time. */
					__( 'Backend is slow — avg %s' ),
					formatted
				) }
			>
				{ __(
					'Most requests are taking longer than expected. Review the slowest requests below to find the cause.'
				) }
			</Notice>
		);
	}

	if ( intent === 'warning' ) {
		return (
			<Notice
				variant="warning"
				title={ sprintf(
					/* translators: %s is the average response time. */
					__( 'Backend needs improvement — avg %s' ),
					formatted
				) }
			>
				{ __(
					'Some requests are running slow. Review the slowest requests below to make targeted improvements.'
				) }
			</Notice>
		);
	}

	return (
		<Notice
			variant="success"
			title={ sprintf(
				/* translators: %s is the average response time. */
				__( 'Healthy backend — avg %s' ),
				formatted
			) }
		>
			{ __( 'Most requests respond quickly. Review the slowest ones below to keep it that way.' ) }
		</Notice>
	);
}
