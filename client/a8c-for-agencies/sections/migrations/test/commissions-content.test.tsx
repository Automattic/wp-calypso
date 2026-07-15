/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import MigrationsCommissionsContent from '../commissions-content';
import useFetchTaggedSitesForMigration from '../hooks/use-fetch-tagged-sites-for-migration';

jest.mock( '../hooks/use-fetch-tagged-sites-for-migration' );

const baseProps = {
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

function renderContent() {
	const client = new QueryClient();
	return render(
		<QueryClientProvider client={ client }>
			<MigrationsCommissionsContent { ...baseProps } />
		</QueryClientProvider>
	);
}

describe( 'MigrationsCommissionsContent', () => {
	it( 'shows the empty state when there are no tagged sites', () => {
		jest
			.mocked( useFetchTaggedSitesForMigration )
			.mockReturnValue( { data: [], isLoading: false } as never );

		renderContent();

		expect(
			screen.getByText( 'View your migrated websites and commissions right here.' )
		).toBeVisible();
	} );
} );
