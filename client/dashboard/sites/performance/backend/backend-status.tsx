import { __, sprintf } from '@wordpress/i18n';
import { Notice } from '../../../components/notice';
import { BACKEND_THRESHOLDS_MS, bucketByMs, formatMs } from './utils';
import type { ApmSummary } from '@automattic/api-core';

export default function BackendStatusNotice( {
	summary,
	apmEnabled,
	isRollingWindow,
}: {
	summary: ApmSummary;
	apmEnabled: boolean;
	isRollingWindow: boolean;
} ) {
	const hasData = summary.transaction_count > 0;

	if ( ! hasData ) {
		if ( ! isRollingWindow ) {
			return (
				<Notice variant="info" title={ __( 'No data in the selected timeframe' ) }>
					{ __(
						'Try a different timeframe, or check back later if you just changed the capture settings.'
					) }
				</Notice>
			);
		}

		if ( ! apmEnabled ) {
			// The subtitle already says "Capturing is off..." — skip the duplicate notice.
			return null;
		}

		return (
			<Notice variant="info" title={ __( 'Capturing' ) }>
				{ __(
					'Performance data is being collected. New requests will show up here within about 30 seconds.'
				) }
			</Notice>
		);
	}

	const intent = bucketByMs( summary.avg_response_ms, BACKEND_THRESHOLDS_MS.response );
	const formatted = formatMs( summary.avg_response_ms );

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
