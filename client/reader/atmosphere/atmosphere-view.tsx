import './style.scss';

import {
	useConnectionsQuery,
	useCreateConnectionMutation,
	useVerifyConnectionQuery,
} from '@automattic/api-queries';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import NavigationHeader from 'calypso/components/navigation-header';
import ReaderMain from 'calypso/reader/components/reader-main';
import { ConnectForm } from './connect-form';
import { ConnectionsList } from './connections-list';
import { VerifyPanel } from './verify-panel';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function AtmosphereView( { selectedTab }: { selectedTab?: string } = {} ) {
	const translate = useTranslate();
	const connections = useConnectionsQuery();
	const create = useCreateConnectionMutation();
	const [ verifyId, setVerifyId ] = useState< number | null >( null );
	const verify = useVerifyConnectionQuery( verifyId );

	const title = translate( 'ATmosphere' );
	const documentTitle = translate( '%s ‹ Reader', {
		args: title,
		comment: '%s is the section name. For example: "ATmosphere"',
	} );

	return (
		<ReaderMain className="atmosphere-view">
			<DocumentHead title={ documentTitle } />
			<NavigationHeader
				title={ title }
				subtitle={ translate( 'Connect your Bluesky account to bring it into the Reader.' ) }
			/>
			<VStack spacing={ 4 } className="atmosphere-view__body">
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
		</ReaderMain>
	);
}

export default AtmosphereView;
