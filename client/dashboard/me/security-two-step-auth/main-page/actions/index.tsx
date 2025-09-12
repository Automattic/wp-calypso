import { useRouter } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { ActionList } from '../../../../components/action-list';
import DisableTwoStepDialog from './disable-two-step-dialog';

export default function TwoStepAuthActions() {
	const router = useRouter();

	const [ showDisableDialog, setShowDisableDialog ] = useState( false );

	return (
		<>
			<ActionList>
				<ActionList.ActionItem
					title={ __( 'Generate new backup codes' ) }
					actions={
						<Button
							onClick={ () => router.navigate( { to: '/me/security/two-step-auth/backup-codes' } ) }
							variant="secondary"
							size="compact"
						>
							{ __( 'Generate backup codes' ) }
						</Button>
					}
				/>
				<ActionList.ActionItem
					title={ __( 'Disable two-step authentication' ) }
					actions={
						<Button
							isDestructive
							onClick={ () => setShowDisableDialog( true ) }
							variant="secondary"
							size="compact"
						>
							{ __( 'Disable' ) }
						</Button>
					}
				/>
			</ActionList>
			{ showDisableDialog && (
				<DisableTwoStepDialog onClose={ () => setShowDisableDialog( false ) } />
			) }
		</>
	);
}
