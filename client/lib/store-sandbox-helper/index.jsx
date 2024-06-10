import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReactDom from 'react-dom';
import useStoreSandboxStatusQuery from 'calypso/data/store-sandbox/use-store-sandbox-status';

import './style.scss';

export function StoreSandboxHelper() {
	const { data: isSandboxed } = useStoreSandboxStatusQuery();

	const menuItemClasses = [
		'store-sandbox-helper__menu-item',
		isSandboxed ? 'is-enabled' : 'is-disabled',
	];
	const popoverStatus = isSandboxed ? 'Store Sandbox is enabled.' : 'Store Sandbox is disabled.';

	return (
		<>
			<div className={ menuItemClasses.join( ' ' ) }>Store Sandbox</div>
			<div className="store-sandbox-helper__popover">{ popoverStatus }</div>
		</>
	);
}
export default ( element ) =>
	ReactDom.render(
		<QueryClientProvider client={ new QueryClient() }>
			<StoreSandboxHelper />
		</QueryClientProvider>,
		element
	);
