import { useCreateConnectionMutation } from '@automattic/api-queries';
import { ConnectForm } from './connect-form';

export function SettingsPanel() {
	const create = useCreateConnectionMutation();
	return (
		<ConnectForm
			isSubmitting={ create.isPending }
			error={ create.error ?? null }
			onSubmit={ ( values ) => create.mutate( values ) }
		/>
	);
}
