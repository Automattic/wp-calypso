import { Button } from '@wordpress/components';
import { dateI18n } from '@wordpress/date';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import InlineSupportLink from '../../components/inline-support-link';

export default function SubTitle( {
	timestamp,
	onClick,
}: {
	timestamp: string | undefined;
	onClick: () => void;
} ) {
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
			dateI18n( 'F jS, Y g:i:s A', timestamp )
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
