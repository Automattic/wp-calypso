/**
 * @jest-environment jsdom
 */
import { useUpdateMigrationStatus } from 'calypso/data/site-migration/use-update-migration-status';

const siteId = 1;

jest.mock( 'calypso/data/site-migration/use-update-migration-status', () => ( {
	useUpdateMigrationStatus: jest.fn(),
} ) );

jest.mock( 'calypso/lib/presales-chat', () => ( {
	usePresalesChat: jest.fn(),
} ) );

jest.mock( 'calypso/data/site-profiler/use-analyze-url-query', () => ( {
	useAnalyzeUrlQuery: () => ( { data: {} } ),
} ) );

jest.mock( 'calypso/data/site-profiler/use-hosting-provider-query', () => ( {
	useHostingProviderQuery: () => ( { data: {} } ),
} ) );

jest.mock( 'calypso/site-profiler/hooks/use-hosting-provider-name', () => jest.fn() );

jest.mock( 'calypso/landing/stepper/hooks/use-site', () => ( {
	useSite: jest.fn( () => ( {
		ID: siteId,
	} ) ),
} ) );

describe( 'SiteMigrationHowToMigrate', () => {
	let mockUpdateMigrationStatus;

	beforeEach( () => {
		mockUpdateMigrationStatus = jest.fn();
		( useUpdateMigrationStatus as jest.Mock ).mockReturnValue( {
			updateMigrationStatus: mockUpdateMigrationStatus,
			updateMigrationStatusAsync: mockUpdateMigrationStatus,
			updateStatusMutationRest: {},
		} );
	} );
} );
