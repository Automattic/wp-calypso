import { useTranslate } from 'i18n-calypso';
import type { FC } from 'react';

export const StepAddMigrationKeyFallback: FC = () => {
	const translate = useTranslate();

	return (
		<p>
			{ translate(
				'Go to the %(pluginName)s page on the new WordPress.com site and copy the migration key. Then paste it on the {{strong}}%(migrationKeyLabel)s{{/strong}} field of your existing site and click {{strong}}%(migrateLabel)s{{/strong}}.',
				{
					components: {
						strong: <strong />,
					},
					args: {
						migrationKeyLabel: 'Migration Key',
						migrateLabel: 'Start migration',
						pluginName: 'Migrate to WordPress.com',
					},
				}
			) }
		</p>
	);
};
