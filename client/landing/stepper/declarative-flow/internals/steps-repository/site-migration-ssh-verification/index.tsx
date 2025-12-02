import { Step } from '@automattic/onboarding';
import { useEffect } from 'react';
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

	// Verify SSH migration atomic transfer capability
	const {
		data: verificationData,
		isError: verificationError,
		isSuccess,
	} = useVerifySSHMigrationAtomicTransfer( siteId );

	// Auto-submit when verification completes
	useEffect( () => {
		if ( isSuccess && verificationData ) {
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
	}, [ isSuccess, verificationData, verificationError, navigation ] );

	return (
		<>
			<Step.Loading delay={ 500 } />
		</>
	);
};

export default SiteMigrationSshVerification;
