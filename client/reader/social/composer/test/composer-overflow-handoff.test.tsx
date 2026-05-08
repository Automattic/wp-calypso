/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import nock from 'nock';
import { ComposerOverflowHandoff } from '../composer-overflow-handoff';
import { ComposerProvider, useComposer } from '../composer-provider';
import { testComposerConfig } from '../test-config';
import type { Site } from '@automattic/api-core';
import type { ReactNode } from 'react';

const ORIGIN = 'https://public-api.wordpress.com';

function renderWithComposer( ui: ReactNode, { withMode = false } = {} ) {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false } },
	} );

	function Inner() {
		const composer = useComposer();
		if ( withMode && ! composer.mode ) {
			composer.openComposer( { kind: 'standalone', entry_point: 'fab' } );
		}
		return <>{ ui }</>;
	}

	return render(
		<QueryClientProvider client={ queryClient }>
			<ComposerProvider connectionId={ 1 } config={ testComposerConfig }>
				<Inner />
			</ComposerProvider>
		</QueryClientProvider>
	);
}

// Used by tests added in later tasks of the overflow-handoff series.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function mockSitesQuery( sites: Partial< Site >[] ) {
	nock( ORIGIN )
		.get( /\/rest\/v1\.\d+\/me\/sites/ )
		.reply( 200, { sites } );
}

afterEach( () => nock.cleanAll() );

describe( 'ComposerOverflowHandoff — gate', () => {
	it( 'renders nothing when hasBeenOverLimit is false', () => {
		renderWithComposer( <ComposerOverflowHandoff text="hello" /> );
		expect( screen.queryByRole( 'region', { name: /publish on your own site/i } ) ).toBeNull();
	} );
} );
