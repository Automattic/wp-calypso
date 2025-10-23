import { Step } from '@automattic/onboarding';
import { translate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { useFlowState } from 'calypso/landing/stepper/declarative-flow/internals/state-manager/store';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useVerifySSHMigrationAtomicTransfer } from '../site-migration-ssh-share-access/hooks/use-verify-ssh-migration-atomic-transfer';
import type { Step as StepType } from '../../types';

const SiteMigrationSshVerification: StepType< {
	submits: {
		verified: boolean;
		transferId?: number;
		allowSiteMigration?: boolean;
	};
} > = function ( { navigation } ) {
	const site = useSite();
	const siteId = site?.ID ?? 0;
	const title = translate( 'Verifying site migration capability' );
	const { set } = useFlowState();

	// Verify SSH migration atomic transfer capability
	const {
		data: verificationData,
		isError: verificationError,
		isSuccess,
	} = useVerifySSHMigrationAtomicTransfer( siteId );

	// Auto-submit when verification completes
	useEffect( () => {
		if ( isSuccess && verificationData ) {
			// Store transfer_id in flow state for polling in SSH share access step
			set( 'sshMigration', {
				transferId: verificationData.transfer_id,
				blogId: verificationData.blog_id,
				transferStatus: verificationData.transfer_status,
			} );

			navigation.submit?.( {
				verified: true,
				transferId: verificationData.transfer_id,
				allowSiteMigration: verificationData.allow_site_migration,
			} );
		} else if ( verificationError ) {
			// If verification fails, treat it as not allowed
			navigation.submit?.( {
				verified: false,
				allowSiteMigration: false,
			} );
		}
	}, [ isSuccess, verificationData, verificationError, navigation, set ] );

	return (
		<>
			<DocumentHead title={ title } />
			<Step.Loading title={ title } delay={ 500 } />
		</>
	);
};

export default SiteMigrationSshVerification;
