/**
 * @jest-environment jsdom
 */
import React from 'react';
import { useUpdateMigrationStatus } from 'calypso/data/site-migration/use-update-migration-status';
import { RenderStepOptions, mockStepProps, renderStep } from '../../test/helpers';
import SiteMigrationHowToMigrate from '../index';
import type { StepProps } from '../../../types';

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

const render = ( props?: Partial< StepProps >, renderOptions?: RenderStepOptions ) => {
	const combinedProps = { ...mockStepProps( props ) };
	return renderStep( <SiteMigrationHowToMigrate { ...combinedProps } />, renderOptions );
};

describe( 'SiteMigrationHowToMigrate', () => {
	const mockSubmit = jest.fn();
	let mockUpdateMigrationStatus;

	beforeEach( () => {
		mockUpdateMigrationStatus = jest.fn();
		( useUpdateMigrationStatus as jest.Mock ).mockReturnValue( {
			updateMigrationStatus: mockUpdateMigrationStatus,
			updateMigrationStatusAsync: mockUpdateMigrationStatus,
			updateStatusMutationRest: {},
		} );
	} );

	it( 'should register pending migration status when the component is loaded', () => {
		render( { navigation: { submit: mockSubmit } } );

		expect( mockUpdateMigrationStatus ).toHaveBeenCalledWith( siteId, 'migration-pending' );
	} );
} );
