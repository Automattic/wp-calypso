import { useTranslate } from 'i18n-calypso';
import { MigrationKeyInput } from '../migration-key-input';
import type { FC } from 'react';

interface Props {
	migrationKey: string;
}

export const StepAddMigrationKey: FC< Props > = ( { migrationKey } ) => {
	const translate = useTranslate();

	if ( '' === migrationKey ) {
		return (
			<>
				<p>{ translate( 'The key will be available here when your new site is ready.' ) }</p>
				<div className="migration-key-skeleton" />
			</>
		);
	}

	return (
		<>
			<p>
				{ translate(
					'Copy and paste the migration key below in the {{strong}}%(migrationKeyLabel)s{{/strong}} field, customize any of the following migration options, and click {{strong}}%(migrateLabel)s{{/strong}}.',
					{
						components: {
							strong: <strong />,
						},
						args: { migrationKeyLabel: 'Migrate Guru Migration Key', migrateLabel: 'Migrate' },
					}
				) }
			</p>
			<MigrationKeyInput value={ migrationKey } />
		</>
	);
};
