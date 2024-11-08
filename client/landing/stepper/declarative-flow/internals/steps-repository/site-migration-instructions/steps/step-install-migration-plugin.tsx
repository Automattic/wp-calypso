import config from '@automattic/calypso-config';
import { ExternalLink } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { recordMigrationInstructionsLinkClick } from '../tracking';
import { getMigrationPluginInstallURL } from './utils';
import type { FC } from 'react';

interface Props {
	fromUrl: string;
}

export const StepInstallMigrationPlugin: FC< Props > = ( { fromUrl } ) => {
	const translate = useTranslate();
	const isWhiteLabeledPluginEnabled = config.isEnabled(
		'migration-flow/enable-white-labeled-plugin'
	);
	const pluginName = isWhiteLabeledPluginEnabled ? 'Migrate to WordPress.com' : 'Migrate Guru';

	return (
		<p>
			{ translate(
				"First you'll need to install and activate the {{a}}%(pluginName)s plugin{{/a}} on the site you want to migrate. Click {{strong}}Next{{/strong}} when you're ready.",
				{
					components: {
						strong: <strong />,
						a: (
							<ExternalLink
								href={ getMigrationPluginInstallURL( fromUrl ) }
								icon
								iconSize={ 14 }
								target="_blank"
								onClick={ () => recordMigrationInstructionsLinkClick( 'install-plugin' ) }
							/>
						),
					},
					args: { pluginName },
				}
			) }
		</p>
	);
};
