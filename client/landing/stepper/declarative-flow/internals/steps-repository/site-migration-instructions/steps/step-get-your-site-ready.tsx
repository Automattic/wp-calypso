import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { recordMigrationInstructionsLinkClick } from '../tracking';
import { getMigrateGuruPageURL } from './utils';
import type { FC } from 'react';

interface Props {
	fromUrl: string;
	onNextClick: () => void;
}

export const StepGetYourSiteReady: FC< Props > = ( { fromUrl, onNextClick } ) => {
	const translate = useTranslate();

	const onGetStartedClick = () => {
		window.open( getMigrateGuruPageURL( fromUrl ), '_blank' );
		recordMigrationInstructionsLinkClick( 'go-to-plugin-page' );
	};

	return (
		<>
			<p>
				{ translate(
					'Head to the Migrate Guru plugin screen on your source site, enter your email address, and click {{strong}}%(migrateLabel)s{{/strong}}.',
					{
						components: {
							strong: <strong />,
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
			<div className="checklist-item__checklist-expanded-ctas">
				<Button
					className="checklist-item__checklist-expanded-cta"
					variant="primary"
					onClick={ onGetStartedClick }
				>
					{ translate( 'Get started' ) }
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
