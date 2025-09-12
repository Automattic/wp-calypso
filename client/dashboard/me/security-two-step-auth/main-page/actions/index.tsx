import { useRouter } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { ActionList } from '../../../../components/action-list';

export default function TwoStepAuthActions() {
	const router = useRouter();
	return (
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
		</ActionList>
	);
}
