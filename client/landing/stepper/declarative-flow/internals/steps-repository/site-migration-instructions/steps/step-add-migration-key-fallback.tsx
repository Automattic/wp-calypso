import config from '@automattic/calypso-config';
import { ExternalLink } from '@automattic/components';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { recordMigrationInstructionsLinkClick } from '../tracking';
import { getMigrateGuruPageURL } from './utils';
import type { FC } from 'react';

export const StepAddMigrationKeyFallback: FC = () => {
	const translate = useTranslate();
	const hasEnTranslation = useHasEnTranslation();
	const site = useSite();
	const siteUrl = site?.URL ?? '';
	const isWhiteLabeledPluginEnabled = config.isEnabled(
		'migration-flow/enable-white-labeled-plugin'
	);
	const migrationKeyLabel = isWhiteLabeledPluginEnabled
		? 'Migration Key'
		: 'Migrate Guru Migration Key';
	const migrateLabel = isWhiteLabeledPluginEnabled ? 'Start migration' : 'Migrate';
	const pluginName = isWhiteLabeledPluginEnabled ? 'Migrate to WordPress.com' : 'Migrate Guru';
	const ctaTranslationComponents = {
		a: (
			<ExternalLink
				href={ getMigrateGuruPageURL( siteUrl ) }
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
			{ hasEnTranslation(
				'Go to the {{a}}%(pluginName)s page on the new WordPress.com site{{/a}} and copy the migration key. Then paste it on the {{strong}}%(migrationKeyLabel)s{{/strong}} field of your existing site and click {{strong}}%(migrateLabel)s{{/strong}}.'
			)
				? translate(
						'Go to the {{a}}%(pluginName)s page on the new WordPress.com site{{/a}} and copy the migration key. Then paste it on the {{strong}}%(migrationKeyLabel)s{{/strong}} field of your existing site and click {{strong}}%(migrateLabel)s{{/strong}}.',
						{
							components: ctaTranslationComponents,
							args: { pluginName, migrationKeyLabel, migrateLabel },
						}
				  )
				: translate(
						'Go to the {{a}}Migrate Guru page on the new WordPress.com site{{/a}} and copy the migration key. Then paste it on the {{strong}}%(migrationKeyLabel)s{{/strong}} field of your existing site and click {{strong}}%(migrateLabel)s{{/strong}}.',
						{
							components: ctaTranslationComponents,
							args: { migrationKeyLabel, migrateLabel },
						}
				  ) }
		</p>
	);
};
