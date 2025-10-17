import { __experimentalText as Text, Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useFormattedTime } from '../../components/formatted-time';

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
		return <Text variant="muted">{ __( 'Testing your site may take around 30 seconds.' ) }</Text>;
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
