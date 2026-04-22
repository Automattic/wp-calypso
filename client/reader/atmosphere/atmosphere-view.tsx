import './style.scss';

import {
	useConnectionsQuery,
	useCreateConnectionMutation,
	useVerifyConnectionQuery,
} from '@automattic/api-queries';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { ConnectForm } from './connect-form';
import { ConnectionsList } from './connections-list';
import { VerifyPanel } from './verify-panel';

export function AtmosphereView() {
	const translate = useTranslate();
	const connections = useConnectionsQuery();
	const create = useCreateConnectionMutation();
	const [ verifyId, setVerifyId ] = useState< number | null >( null );
	const verify = useVerifyConnectionQuery( verifyId );

	return (
		<VStack spacing={ 4 } className="atmosphere-view">
			<h1>{ translate( 'ATmosphere' ) }</h1>
			<ConnectionsList
				connections={ connections.data?.connections ?? [] }
				isLoading={ connections.isLoading }
				onVerify={ setVerifyId }
			/>
			<ConnectForm
				isSubmitting={ create.isPending }
				error={ create.error }
				onSubmit={ ( values ) => create.mutate( values ) }
			/>
			<VerifyPanel
				data={ verify.data ?? null }
				error={ verify.error }
				isLoading={ verify.isFetching && verifyId !== null }
			/>
		</VStack>
	);
}

export default AtmosphereView;
