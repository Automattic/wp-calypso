import './style.scss';

import {
	useConnectionsQuery,
	useCreateConnectionMutation,
	useVerifyConnectionQuery,
} from '@automattic/api-queries';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useState } from 'react';
import { ConnectForm } from './connect-form';
import { ConnectionsList } from './connections-list';
import { VerifyPanel } from './verify-panel';
import type { AtmosphereError } from '@automattic/api-core';

export default function AtmosphereView() {
	const connections = useConnectionsQuery();
	const create = useCreateConnectionMutation();
	const [ verifyId, setVerifyId ] = useState< number | null >( null );
	const verify = useVerifyConnectionQuery( verifyId );

	return (
		<VStack spacing={ 4 } className="atmosphere-view">
			<ConnectionsList
				connections={ connections.data?.connections ?? [] }
				isLoading={ connections.isLoading }
				onVerify={ setVerifyId }
			/>
			<ConnectForm
				isSubmitting={ create.isPending }
				error={ create.error as AtmosphereError | null }
				onSubmit={ ( values ) => create.mutate( values ) }
			/>
			<VerifyPanel
				data={ verify.data ?? null }
				error={ verify.error as AtmosphereError | null }
				isLoading={ verify.isFetching && verifyId !== null }
			/>
		</VStack>
	);
}
