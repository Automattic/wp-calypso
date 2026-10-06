import { Step } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import type { Step as StepType } from '../../types';

import './style.scss';

const SiteMigrationBackup: StepType = ( { navigation } ) => {
	const translate = useTranslate();
	const title = translate( 'Migrate from a backup file' );
	const returnToAddress = () => navigation.submit?.();

	return (
		<>
			<DocumentHead title={ title } />
			<Step.CenteredColumnLayout
				className="site-migration-backup"
				columnWidth={ 6 }
				topBar={ <Step.TopBar leftElement={ <Step.BackButton onClick={ returnToAddress } /> } /> }
				heading={
					<Step.Heading
						text={ title }
						subText={ translate(
							'Upload the backup and our team restores it on WordPress.com, included in your plan.'
						) }
					/>
				}
			>
				<div className="site-migration-backup__card">
					<button className="site-migration-backup__drop-zone" disabled>
						<span className="site-migration-backup__drop-zone-title">
							{ translate( 'Drag your backup here, or choose a file' ) }
						</span>
						<span className="site-migration-backup__drop-zone-description">
							{ translate(
								'Zip, tar.gz or .wpress, up to 20 GB. One file, including the database.'
							) }
						</span>
					</button>
					<p className="site-migration-backup__description">
						{ translate(
							'Use a full-site backup, files and database together, from your host or a plugin such as UpdraftPlus or All-in-One WP Migration. Our team restores it on WordPress.com and checks it over. You hear from us by email, usually within 2 to 3 business days, and your current site stays as it is.'
						) }
					</p>
					<Step.PrimaryButton disabled>{ translate( 'Send to the team' ) }</Step.PrimaryButton>
					<Step.LinkButton onClick={ returnToAddress }>
						{ translate( 'Rather give us access? Enter your site’s address instead' ) }
					</Step.LinkButton>
				</div>
			</Step.CenteredColumnLayout>
		</>
	);
};

export default SiteMigrationBackup;
