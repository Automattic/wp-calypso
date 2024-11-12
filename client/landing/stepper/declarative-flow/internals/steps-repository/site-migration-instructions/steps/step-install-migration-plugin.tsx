import { useTranslate } from 'i18n-calypso';
import type { FC } from 'react';

export const StepInstallMigrationPlugin: FC = () => {
	const translate = useTranslate();

	return (
		<p>
			{ translate(
				"First you'll need to install and activate the Migrate to WordPress.com plugin on the site you want to migrate. Click {{strong}}Next{{/strong}} when you're ready.",
				{
					components: {
						strong: <strong />,
					},
				}
			) }
		</p>
	);
};
