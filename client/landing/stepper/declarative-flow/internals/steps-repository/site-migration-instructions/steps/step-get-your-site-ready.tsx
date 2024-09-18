import { useTranslate } from 'i18n-calypso';
import type { FC } from 'react';

export const StepGetYourSiteReady: FC = () => {
	const translate = useTranslate();

	return (
		<>
			<p>
				{ translate(
					'Head to the Migrate Guru plugin screen on your source site, enter your email address, and click {{strong}}%(migrateLabel)s{{/strong}}.',
					{
						components: {
							strong: <strong />,
						},
						args: { migrateLabel: 'Migrate' },
					}
				) }
			</p>
			<p>{ translate( 'Then, pick WordPress.com as your destination host.' ) }</p>
			<p>
				{ translate( 'All set? Click {{strong}}Next{{/strong}} below.', {
					components: {
						strong: <strong />,
					},
				} ) }
			</p>
		</>
	);
};
