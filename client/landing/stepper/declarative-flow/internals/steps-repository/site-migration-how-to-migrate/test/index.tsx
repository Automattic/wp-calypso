/**
 * @jest-environment jsdom
 */
import userEvent from '@testing-library/user-event';
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
	let mockUpdateMigrationStatus;

	beforeEach( () => {
		jest.clearAllMocks();
		mockUpdateMigrationStatus = jest.fn();
		( useUpdateMigrationStatus as jest.Mock ).mockReturnValue( {
			mutate: mockUpdateMigrationStatus,
			isPending: false,
			isSuccess: false,
		} );
	} );

	it( 'should call updateMigrationStatus with correct value for DIFM option', async () => {
		const submit = jest.fn();
		const { getByText } = render( { navigation: { submit } } );
		const optionButton = getByText( 'Do it for me' );

		await userEvent.click( optionButton );

		expect( mockUpdateMigrationStatus ).toHaveBeenCalledWith( {
			siteId,
			statusSticker: 'migration-pending-difm',
		} );
	} );

	it( 'should call updateMigrationStatus with correct value for DIY option', async () => {
		const submit = jest.fn();
		const { getByText } = render( { navigation: { submit } } );

		const optionButton = getByText( "I'll do it myself" );

		await userEvent.click( optionButton );

		expect( mockUpdateMigrationStatus ).toHaveBeenCalledWith( {
			siteId,
			statusSticker: 'migration-pending-diy',
		} );
	} );

	it( 'should call submit when the user select DIFM and the status is updated', async () => {
		const submit = jest.fn();

		( useUpdateMigrationStatus as jest.Mock ).mockReturnValue( {
			isSuccess: true,
			mutate: jest.fn(),
		} );

		const { getByText } = render( { navigation: { submit } } );

		const optionButton = getByText( 'Do it for me' );
		await userEvent.click( optionButton );

		expect( submit ).toHaveBeenCalledWith( { destination: 'upgrade', how: 'difm' } );
	} );

	it( 'should call submit with correct value for DIY option', async () => {
		const submit = jest.fn();

		( useUpdateMigrationStatus as jest.Mock ).mockReturnValue( {
			isSuccess: true,
			mutate: jest.fn(),
		} );

		const { getByText } = render( { navigation: { submit } } );
		const optionButton = getByText( "I'll do it myself" );
		await userEvent.click( optionButton );

		expect( submit ).toHaveBeenCalledWith( { destination: 'upgrade', how: 'myself' } );
	} );
} );
