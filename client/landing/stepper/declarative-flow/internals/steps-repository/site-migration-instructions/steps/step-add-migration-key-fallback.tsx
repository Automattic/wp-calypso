import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { recordMigrationInstructionsLinkClick } from '../tracking';
import { getMigrateGuruPageURL } from './utils';
import type { FC } from 'react';

interface Props {
	onDoneClick: () => void;
}

export const StepAddMigrationKeyFallback: FC< Props > = ( { onDoneClick } ) => {
	const translate = useTranslate();
	const site = useSite();
	const siteUrl = site?.URL ?? '';

	const onGetKeyClick = () => {
		window.open( getMigrateGuruPageURL( siteUrl ), '_blank' );
		recordMigrationInstructionsLinkClick( 'copy-key-fallback' );
	};

	return (
		<>
			<p>
				{ translate(
					'Go to the Migrate Guru page on the new WordPress.com site and copy the migration key. Then paste it on the {{strong}}%(migrationKeyLabel)s{{/strong}} field of your existing site and click {{strong}}%(migrateLabel)s{{/strong}}.',
					{
						components: {
							strong: <strong />,
						},
						args: {
							migrationKeyLabel: 'Migrate Guru Migration Key',
							migrateLabel: 'Migrate',
						},
					}
				) }
			</p>
			<div className="checklist-item__checklist-expanded-ctas">
				<Button
					className="checklist-item__checklist-expanded-cta"
					variant="primary"
					onClick={ onGetKeyClick }
				>
					{ translate( 'Get the key' ) }
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
