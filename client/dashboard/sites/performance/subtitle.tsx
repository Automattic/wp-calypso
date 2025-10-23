import { __experimentalText as Text, Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useTimeSince } from '../../components/time-since';

const REPORT_REFRESH_THRESHOLD_HOURS = 48;

function isReportOlderThan( reportTimestamp: string, hours: number ): boolean {
	const now = new Date();
	const reportDate = new Date( reportTimestamp );

	if ( isNaN( reportDate.getTime() ) ) {
		return false;
	}

	return now.getTime() - reportDate.getTime() > hours * 60 * 60 * 1000;
}

export default function Subtitle( {
	timestamp,
	onClick,
}: {
	timestamp: string | undefined;
	onClick: () => void;
} ) {
	const timeSince = useTimeSince( timestamp ?? '' );

	if ( ! timestamp ) {
		return <Text variant="muted">{ __( 'Testing your site may take around 30 seconds.' ) }</Text>;
	}

	if ( isReportOlderThan( timestamp, REPORT_REFRESH_THRESHOLD_HOURS ) ) {
		return createInterpolateElement(
			sprintf(
				/* translators: %s: relative time since last test run */
				__(
					'Last test ran <b>%s</b>. Test again if your site has changed. <button>Test again</button>'
				),
				timeSince
			),
			{
				b: <strong />,
				button: <Button variant="link" onClick={ onClick } />,
			}
		);
	}

	return createInterpolateElement(
		sprintf(
			/* translators: %s: relative time since last test run */
			__( 'Last test ran %s. <button>Test again</button>' ),
			timeSince
		),
		{
			button: <Button variant="link" onClick={ onClick } />,
		}
	);
}
