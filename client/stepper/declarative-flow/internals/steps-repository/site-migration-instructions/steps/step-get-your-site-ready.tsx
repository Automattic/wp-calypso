import { useTranslate } from 'i18n-calypso';
import type { FC } from 'react';

export const StepGetYourSiteReady: FC = () => {
	const translate = useTranslate();

	return (
		<>
			<p>
				{ translate(
					'Head to the %(pluginName)s plugin screen on your source site, enter your email address, and click {{strong}}%(migrateLabel)s{{/strong}}.',
					{
						components: {
							strong: <strong />,
						},
						args: {
							migrateLabel: 'Continue',
							pluginName: 'Migrate to WordPress.com',
						},
					}
				) }
			</p>
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
