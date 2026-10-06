import { Step } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import type { Step as StepType } from '../../types';

const SiteMigrationBackup: StepType = ( { navigation } ) => {
	const translate = useTranslate();
	const title = translate( 'Migrate from a backup file' );
	const returnToAddress = () => navigation.submit?.();

	return (
		<>
			<DocumentHead title={ title } />
			<Step.CenteredColumnLayout
				columnWidth={ 4 }
				topBar={ <Step.TopBar leftElement={ <Step.BackButton onClick={ returnToAddress } /> } /> }
				heading={
					<Step.Heading
						text={ title }
						subText={ translate(
							'Backup uploads aren’t available yet. Enter your site’s address to continue.'
						) }
					/>
				}
			>
				<Step.LinkButton onClick={ returnToAddress }>
					{ translate( 'Enter your site’s address' ) }
				</Step.LinkButton>
			</Step.CenteredColumnLayout>
		</>
	);
};

export default SiteMigrationBackup;
