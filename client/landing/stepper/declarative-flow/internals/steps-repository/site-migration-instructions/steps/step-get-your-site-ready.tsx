import config from '@automattic/calypso-config';
import { ExternalLink } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { recordMigrationInstructionsLinkClick } from '../tracking';
import { getMigrationPluginPageURL } from './utils';
import type { FC } from 'react';

interface Props {
	fromUrl: string;
}

export const StepGetYourSiteReady: FC< Props > = ( { fromUrl } ) => {
	const translate = useTranslate();
	const isWhiteLabeledPluginEnabled = config.isEnabled(
		'migration-flow/enable-white-labeled-plugin'
	);
	const pluginName = isWhiteLabeledPluginEnabled ? 'Migrate to WordPress.com' : 'Migrate Guru';

	return (
		<>
			<p>
				{ translate(
					'Head to the {{a}}%(pluginName)s plugin screen on your source site{{/a}}, enter your email address, and click {{strong}}%(migrateLabel)s{{/strong}}.',
					{
						components: {
							strong: <strong />,
							a: fromUrl ? (
								<ExternalLink
									href={ getMigrationPluginPageURL( fromUrl ) }
									icon
									iconSize={ 14 }
									target="_blank"
									onClick={ () => recordMigrationInstructionsLinkClick( 'go-to-plugin-page' ) }
								/>
							) : (
								<strong />
							),
						},
						args: {
							pluginName,
							migrateLabel: isWhiteLabeledPluginEnabled ? 'Continue' : 'Migrate',
						},
					}
				) }
			</p>
			<p>
				{ ! isWhiteLabeledPluginEnabled &&
					translate( 'Then, pick WordPress.com as your destination host.' ) }
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
