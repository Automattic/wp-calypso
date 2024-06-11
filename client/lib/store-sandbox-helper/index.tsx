import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToggleControl } from '@wordpress/components';
import { useState } from 'react';
import ReactDom from 'react-dom';
import useStoreSandboxStatusQuery from 'calypso/data/store-sandbox/use-store-sandbox-status';
import wp from 'calypso/lib/wp';

import './style.scss';

interface StoreSandboxQueryResponse {
	store_sandbox_cookie_name: string | undefined;
	store_sandbox_expiration_time: number | undefined;
	is_disabled: boolean | undefined;
}

export function StoreSandboxHelper() {
	const { data: isSandboxed } = useStoreSandboxStatusQuery();
	const [ isStoreSandboxed, setIsStoreSandboxed ] = useState( isSandboxed );

	const onToggleStoreSandbox = () => {
		wp.req.post(
			{
				path: `/store-sandbox/${ isStoreSandboxed ? 'disable' : 'enable' }`,
				apiNamespace: 'wpcom/v2',
			},
			{},
			( error: string, data: StoreSandboxQueryResponse ) => {
				if ( ! error && data ) {
					setIsStoreSandboxed( !! data?.store_sandbox_cookie_name );
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
					label="Store Sandbox"
					checked={ isStoreSandboxed || false }
					onChange={ onToggleStoreSandbox }
					help={ popoverStatus }
				/>
			</div>
		</>
	);
}
export default ( element: HTMLElement ) =>
	ReactDom.render(
		<QueryClientProvider client={ new QueryClient() }>
			<StoreSandboxHelper />
		</QueryClientProvider>,
		element
	);
