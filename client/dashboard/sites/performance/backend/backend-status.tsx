import { __, sprintf } from '@wordpress/i18n';
import { Notice } from '../../../components/notice';

export type BackendStatus = 'good' | 'needsImprovement' | 'bad';

export function getBackendStatus( avgResponseMs: number ): BackendStatus {
	if ( avgResponseMs <= 500 ) {
		return 'good';
	}
	if ( avgResponseMs <= 1500 ) {
		return 'needsImprovement';
	}
	return 'bad';
}

function formatMs( ms: number ): string {
	if ( ms >= 1000 ) {
		return sprintf(
			/* translators: %s is a number of seconds. */
			__( '%s s' ),
			( ms / 1000 ).toFixed( 2 )
		);
	}
	return sprintf(
		/* translators: %d is a number of milliseconds. */
		__( '%d ms' ),
		ms
	);
}

export default function BackendStatusNotice( { avgResponseMs }: { avgResponseMs: number } ) {
	const status = getBackendStatus( avgResponseMs );
	const formatted = formatMs( avgResponseMs );

	if ( status === 'bad' ) {
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

	if ( status === 'needsImprovement' ) {
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
