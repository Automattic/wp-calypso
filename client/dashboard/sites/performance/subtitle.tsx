import { localizeUrl } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { dateI18n } from '@wordpress/date';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

export default function SubTitle( {
	timestamp,
	onClick,
}: {
	timestamp: string | undefined;
	onClick: () => void;
} ) {
	if ( ! timestamp ) {
		return createInterpolateElement(
			__( 'Optimize your site for lightning-fast performance. <link>Learn more.</link>' ),
			{
				link: (
					<a
						href={ localizeUrl( 'https://wordpress.com/support/check-your-sites-performance/' ) }
					/>
				),
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
