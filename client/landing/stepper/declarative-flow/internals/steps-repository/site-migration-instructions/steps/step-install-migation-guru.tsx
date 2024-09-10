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

	return (
		<p>
			{ translate(
				"First you'll need to install and activate the {{a}}Migrate Guru plugin{{/a}} on the site you want to migrate. Click {{strong}}Next{{/strong}} when you're ready.",
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
				}
			) }
		</p>
	);
};
