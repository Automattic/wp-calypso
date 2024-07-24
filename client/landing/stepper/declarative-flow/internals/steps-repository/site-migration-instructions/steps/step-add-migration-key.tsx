import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { MigrationKeyInput } from '../migration-key-input';
import type { FC } from 'react';

interface Props {
	migrationKey: string;
	preparationError: Error | null;
}

export const StepAddMigrationKey: FC< Props > = ( { migrationKey, preparationError } ) => {
	const translate = useTranslate();

	if ( '' === migrationKey ) {
		return (
			<>
				<p>{ translate( 'The key will be available here when your new site is ready.' ) }</p>
				<div
					className={ clsx( 'migration-key-skeleton', {
						'migration-key-skeleton--animate': ! preparationError,
					} ) }
				/>
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
