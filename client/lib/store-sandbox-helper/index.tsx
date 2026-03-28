import config from '@automattic/calypso-config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToggleControl } from '@wordpress/components';
import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import store from 'store';
import useStoreSandboxStatusQuery from 'calypso/data/store-sandbox/use-store-sandbox-status';
import wp from 'calypso/lib/wp';
import { GUEST_TICKET_LOCALFORAGE_KEY } from 'calypso/lib/wp/handlers/guest-sandbox-ticket';

import './style.scss';

interface StoreSandboxQueryResponse {
	store_sandbox_cookie_name: string | undefined;
	store_sandbox_expiration_time: number | undefined;
	store_sandbox_ticket_value: string | undefined;
	is_disabled: boolean | undefined;
}

export function StoreSandboxHelper() {
	const { data: storeSandboxStatus, isLoading: isLoading } = useStoreSandboxStatusQuery();
	const isSandboxed = storeSandboxStatus?.sandbox_status ?? false;
	const isEditable = storeSandboxStatus?.is_editable ?? false;
	const reasonNotEditable = storeSandboxStatus?.reason_not_editable
		? storeSandboxStatus.reason_not_editable
		: null;
	const reasonNotEditableText = isLoading ? 'Loading...' : reasonNotEditable;

	const [ isStoreSandboxed, setIsStoreSandboxed ] = useState( isSandboxed );
	const [ responseError, setResponseError ] = useState< string | null >( null );

	useEffect( () => {
		setIsStoreSandboxed( isSandboxed );
	}, [ isSandboxed ] );

	const onToggleStoreSandbox = () => {
		wp.req.post(
			{
				path: `/store-sandbox/${ isStoreSandboxed ? 'disable' : 'enable' }`,
				apiNamespace: 'wpcom/v2',
			},
			{},
			( error: Error, data: StoreSandboxQueryResponse ) => {
				if ( error ) {
					setResponseError( error.message || String( error ) );
				}

				if ( ! error && data ) {
					if ( config.isEnabled( 'oauth' ) ) {
						if ( data?.store_sandbox_ticket_value ) {
							store.set( GUEST_TICKET_LOCALFORAGE_KEY, {
								createdDate: Date.now(),
								value: data.store_sandbox_ticket_value,
							} );
						} else if ( data?.is_disabled ) {
							store.remove( GUEST_TICKET_LOCALFORAGE_KEY );
						}
					}
					setIsStoreSandboxed( !! data?.store_sandbox_cookie_name );
					window.location.reload();
				}
			}
		);
	};

	const menuItemClasses = [
		'store-sandbox-helper__menu-item',
		isStoreSandboxed ? 'is-enabled' : 'is-disabled',
	];
	const popoverStatus = isStoreSandboxed
		? 'Store Sandbox is enabled.'
		: 'Store Sandbox is disabled.';

	return (
		<>
			<div className={ menuItemClasses.join( ' ' ) }>Store Sandbox</div>
			<div className="store-sandbox-helper__popover">
				<ToggleControl
					__nextHasNoMarginBottom
					label="Store Sandbox"
					checked={ isStoreSandboxed || false }
					disabled={ ! isEditable }
					onChange={ onToggleStoreSandbox }
					help={ responseError ?? reasonNotEditableText ?? popoverStatus }
				/>
			</div>
		</>
	);
}
export default ( element: HTMLElement ) =>
	createRoot( element ).render(
		<QueryClientProvider client={ new QueryClient() }>
			<StoreSandboxHelper />
		</QueryClientProvider>
	);
