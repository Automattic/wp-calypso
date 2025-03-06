import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { recordMigrationInstructionsLinkClick } from '../tracking';
import type { FC } from 'react';
import './style.scss';

type SupportNudgeProps = {
	navigateToDoItForMe: () => void;
};

export const SupportNudge: FC< SupportNudgeProps > = ( { navigateToDoItForMe } ) => {
	const translate = useTranslate();

	return (
		<div className="site-migration-instructions-support-nudge">
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
