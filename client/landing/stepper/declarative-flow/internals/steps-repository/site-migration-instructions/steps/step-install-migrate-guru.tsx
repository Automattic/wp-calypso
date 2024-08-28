import { useTranslate } from 'i18n-calypso';
import type { FC } from 'react';

export const StepInstallMigrateGuru: FC = () => {
	const translate = useTranslate();

	return (
		<p>
			{ translate(
				"First you'll need to install and activate the Migrate Guru plugin on the site you want to migrate. Click {{strong}}Next{{/strong}} when you're ready.",
				{
					components: {
						strong: <strong />,
					},
				}
			) }
		</p>
	);
};
