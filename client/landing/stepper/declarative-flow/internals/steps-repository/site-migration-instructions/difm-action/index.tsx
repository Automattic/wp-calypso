import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { FC } from 'react';
import './style.scss';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

interface DifmActionrops {
	navigateToDoItForMe: () => void;
}

export const DifmAction: FC< DifmActionrops > = ( { navigateToDoItForMe } ) => {
	const translate = useTranslate();

	return (
		<div className="site-migration-instructions-difm-action">
			{ translate( 'Having trouble? {{button}}Let us migrate your site{{/button}}', {
				components: {
					button: (
						<Button
							variant="link"
							onClick={ () => {
								recordTracksEvent( 'calypso_migration_instructions_difm_click' );
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
