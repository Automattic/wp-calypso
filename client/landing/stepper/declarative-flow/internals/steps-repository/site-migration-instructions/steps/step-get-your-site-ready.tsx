import { ExternalLink } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { recordMigrationInstructionsLinkClick } from '../tracking';
import { getMigrateGuruPageURL } from './utils';
import type { FC } from 'react';

interface Props {
	fromUrl: string;
}

export const StepGetYourSiteReady: FC< Props > = ( { fromUrl } ) => {
	const translate = useTranslate();

	return (
		<>
			<p>
				{ translate(
					'Head to the {{a}}Migrate Guru plugin screen on your source site{{/a}}, enter your email address, and click {{strong}}%(migrateLabel)s{{/strong}}.',
					{
						components: {
							strong: <strong />,
							a: fromUrl ? (
								<ExternalLink
									href={ getMigrateGuruPageURL( fromUrl ) }
									icon
									iconSize={ 14 }
									target="_blank"
									onClick={ () => recordMigrationInstructionsLinkClick( 'go-to-plugin-page' ) }
								/>
							) : (
								<strong />
							),
						},
						args: { migrateLabel: 'Migrate' },
					}
				) }
			</p>
			<p>{ translate( 'Then, pick WordPress.com as your destination host.' ) }</p>
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
