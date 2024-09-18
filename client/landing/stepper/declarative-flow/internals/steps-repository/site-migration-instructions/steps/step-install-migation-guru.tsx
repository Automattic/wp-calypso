import config from '@automattic/calypso-config';
import { ExternalLink } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { recordMigrationInstructionsLinkClick } from '../tracking';
import { getPluginInstallationPage } from './utils';
import type { FC } from 'react';

interface Props {
	fromUrl: string;
}

export const StepInstallMigrationGuru: FC< Props > = ( { fromUrl } ) => {
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
								href={ getPluginInstallationPage( fromUrl ) }
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
