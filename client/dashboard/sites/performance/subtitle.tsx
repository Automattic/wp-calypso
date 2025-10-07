import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useFormattedTime } from '../../components/formatted-time';
import InlineSupportLink from '../../components/inline-support-link';

export default function Subtitle( {
	timestamp,
	timezoneString,
	gmtOffset,
	onClick,
}: {
	timestamp: string | undefined;
	timezoneString?: string;
	gmtOffset?: number;
	onClick: () => void;
} ) {
	const formattedTime = useFormattedTime(
		timestamp ?? '',
		{
			dateStyle: 'long',
			timeStyle: 'short',
		},
		timezoneString,
		gmtOffset
	);

	if ( ! timestamp ) {
		return createInterpolateElement(
			__(
				'Optimize your site for lightning-fast performance. <supportLink>Learn more.</supportLink>'
			),
			{
				supportLink: <InlineSupportLink supportContext="site-performance" />,
			}
		);
	}

	return createInterpolateElement(
		sprintf(
			// translators: %s is a date, e.g. March 12, 2025
			__( 'Tested on <span>%s</span>. <button>Test again</button>' ),
			formattedTime
		),
		{
			span: (
				<span
					css={ {
						fontVariantNumeric: 'tabular-nums',
					} }
				/>
			),
			button: <Button variant="link" onClick={ onClick } />,
		}
	);
}
