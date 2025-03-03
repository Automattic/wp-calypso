import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { recordMigrationInstructionsLinkClick } from '../tracking';
import type { FC } from 'react';
import './style.scss';

interface DifmActionProps {
	navigateToDoItForMe: () => void;
}

export const DifmAction: FC< DifmActionProps > = ( { navigateToDoItForMe } ) => {
	const translate = useTranslate();

	return (
		<div className="site-migration-instructions-difm-action">
			{ translate( 'Having trouble? {{button}}Let us migrate your site{{/button}}', {
				components: {
					button: (
						<Button
							variant="link"
							onClick={ () => {
								recordMigrationInstructionsLinkClick( 'trouble-migrate-site' );
								navigateToDoItForMe();
							} }
							type="button"
						/>
					),
				},
			} ) }
		</div>
	);
};
