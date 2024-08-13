import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { MigrationKeyInput } from '../migration-key-input';
import { recordMigrationInstructionsLinkClick } from '../tracking';
import { getMigrateGuruPageURL } from './utils';
import type { FC } from 'react';

interface Props {
	fromUrl: string;
	migrationKey: string;
	onDoneClick: () => void;
	preparationError: Error | null;
}

export const StepAddMigrationKey: FC< Props > = ( {
	fromUrl,
	migrationKey,
	onDoneClick,
	preparationError,
} ) => {
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

	const onEnterKeyClick = () => {
		window.open( getMigrateGuruPageURL( fromUrl ), '_blank' );
		recordMigrationInstructionsLinkClick( 'enter-key' );
	};

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
			<div className="checklist-item__checklist-expanded-ctas">
				<Button
					className="checklist-item__checklist-expanded-cta"
					variant="primary"
					onClick={ onEnterKeyClick }
				>
					{ translate( 'Enter key' ) }
				</Button>
				<Button
					className="checklist-item__checklist-expanded-cta"
					variant="secondary"
					onClick={ onDoneClick }
				>
					{ translate( 'Done' ) }
				</Button>
			</div>
		</>
	);
};
