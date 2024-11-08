import { ExternalLink } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { recordMigrationInstructionsLinkClick } from '../tracking';
import { getMigrationPluginPageURL } from './utils';
import type { FC } from 'react';

export const StepAddMigrationKeyFallback: FC = () => {
	const translate = useTranslate();
	const site = useSite();
	const siteUrl = site?.URL ?? '';
	const migrationKeyLabel = 'Migration Key';
	const migrateLabel = 'Start migration';
	const pluginName = 'Migrate to WordPress.com';
	const ctaTranslationComponents = {
		a: (
			<ExternalLink
				href={ getMigrationPluginPageURL( siteUrl ) }
				icon
				iconSize={ 14 }
				target="_blank"
				onClick={ () => recordMigrationInstructionsLinkClick( 'copy-key-fallback' ) }
			/>
		),
		strong: <strong />,
	};

	return (
		<p>
			{ translate(
				'Go to the {{a}}%(pluginName)s page on the new WordPress.com site{{/a}} and copy the migration key. Then paste it on the {{strong}}%(migrationKeyLabel)s{{/strong}} field of your existing site and click {{strong}}%(migrateLabel)s{{/strong}}.',
				{
					components: ctaTranslationComponents,
					args: { pluginName, migrationKeyLabel, migrateLabel },
				}
			) }
		</p>
	);
};
