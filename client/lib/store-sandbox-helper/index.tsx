import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToggleControl } from '@wordpress/components';
import { useState } from 'react';
import ReactDom from 'react-dom';
import useStoreSandboxStatusQuery from 'calypso/data/store-sandbox/use-store-sandbox-status';
import wp from 'calypso/lib/wp';

import './style.scss';

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
			( error: string, data: string ) => {
				if ( ! error && data ) {
					setIsStoreSandboxed( ! isStoreSandboxed );
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
					checked={ isStoreSandboxed }
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
