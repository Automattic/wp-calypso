import { useTranslate } from 'i18n-calypso';
import type { FC } from 'react';

export const StepInstallMigrationPlugin: FC = () => {
	const translate = useTranslate();

	return (
		<p>
			{ translate(
				"First you'll need to install and activate the %(pluginName)s plugin on the site you want to migrate. Click {{strong}}Next{{/strong}} when you're ready.",
				{
					components: {
						strong: <strong />,
					},
					args: {
						pluginName: 'Migrate to WordPress.com',
					},
				}
			) }
		</p>
	);
};
