/** @jest-environment jsdom */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { useCategories } from '../use-categories';
import type { ReactNode } from 'react';

const state = {
	currentUser: { id: 1 },
	ui: { selectedSiteId: 1 },
	sites: { items: { 1: { ID: 1, jetpack: false } } },
};

jest.mock( 'calypso/state', () => ( {
	useSelector: ( selector: ( value: typeof state ) => unknown ) => selector( state ),
} ) );
jest.mock( 'calypso/my-sites/plugins/hooks/use-is-marketplace-redesign-enabled', () => ( {
	useIsMarketplaceRedesignEnabled: () => false,
} ) );

const pageQueryClient = new QueryClient();
const wrapper = ( { children }: { children: ReactNode } ) => (
	<QueryClientProvider client={ pageQueryClient }>{ children }</QueryClientProvider>
);

beforeEach( () => {
	pageQueryClient.clear();
} );

test( 'includes Describe for logged-in users', () => {
	const { result } = renderHook( () => useCategories(), { wrapper } );
	expect( result.current.describe ).toBeDefined();
} );
