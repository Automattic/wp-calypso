import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { recordMigrationInstructionsLinkClick } from '../tracking';
import { getPluginInstallationPage } from './utils';
import type { FC } from 'react';

interface Props {
	fromUrl: string;
	onNextClick: () => void;
}

export const StepInstallMigrationGuru: FC< Props > = ( { fromUrl, onNextClick } ) => {
	const translate = useTranslate();

	const onInstallPluginClick = () => {
		window.open( getPluginInstallationPage( fromUrl ), '_blank' );
		recordMigrationInstructionsLinkClick( 'install-plugin' );
	};

	return (
		<>
			<p>
				{ translate(
					"First you'll need to install and activate the Migrate Guru plugin on the site you want to migrate. Click {{strong}}Next{{/strong}} when you're ready.",
					{
						components: {
							strong: <strong />,
						},
					}
				) }
			</p>
			<div className="checklist-item__checklist-expanded-ctas">
				<Button
					className="checklist-item__checklist-expanded-cta"
					variant="primary"
					onClick={ onInstallPluginClick }
				>
					{ translate( 'Install plugin' ) }
				</Button>
				<Button
					className="checklist-item__checklist-expanded-cta"
					variant="secondary"
					onClick={ onNextClick }
				>
					{ translate( 'Next' ) }
				</Button>
			</div>
		</>
	);
};
