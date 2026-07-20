/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import MigrationsCommissionsContent from '../commissions-content';
import type { ComponentProps } from 'react';

const baseProps = {
	taggedSites: [],
	isLoading: false,
	recordTracksEvent: () => {},
	onSuccess: () => {},
	onError: () => {},
	getSiteCreatedAt: () => undefined,
	canTagSitesForCommission: true,
	migrationTags: [ 'tag' ],
	isAddSitesModalOpen: false,
	onCloseAddSitesModal: () => {},
	onOpenAddSitesModal: () => {},
};

const EMPTY_STATE_COPY = 'View your migrated websites and commissions right here.';

function renderContent(
	props: Partial< ComponentProps< typeof MigrationsCommissionsContent > > = {}
) {
	const client = new QueryClient();
	return render(
		<QueryClientProvider client={ client }>
			<MigrationsCommissionsContent { ...baseProps } { ...props } />
		</QueryClientProvider>
	);
}

describe( 'MigrationsCommissionsContent', () => {
	it( 'shows the empty state when there are no tagged sites', () => {
		renderContent( { taggedSites: [] } );

		expect( screen.getByText( EMPTY_STATE_COPY ) ).toBeVisible();
	} );

	it( 'shows the loading skeleton and not the empty state while loading', () => {
		renderContent( { isLoading: true } );

		expect( screen.queryByText( EMPTY_STATE_COPY ) ).not.toBeInTheDocument();
	} );
} );
