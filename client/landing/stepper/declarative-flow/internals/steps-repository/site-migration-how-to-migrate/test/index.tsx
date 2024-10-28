/**
 * @jest-environment jsdom
 */
import { fireEvent } from '@testing-library/react';
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
		} );
	} );

	it( 'should register pending migration status when the component is loaded', () => {
		render( { navigation: { submit: mockSubmit } } );

		expect( mockUpdateMigrationStatus ).toHaveBeenCalledWith( siteId, 'migration-pending' );
	} );

	it( 'should call updateMigrationStatus with correct value for DIFM option', () => {
		const { getByText } = render( { navigation: { submit: mockSubmit } } );

		const optionButton = getByText( 'Do it for me' );
		fireEvent.click( optionButton );

		// Check the last call value
		const lastCallValue =
			mockUpdateMigrationStatus.mock.calls[ mockUpdateMigrationStatus.mock.calls.length - 1 ][ 1 ];
		expect( lastCallValue ).toBe( 'migration-pending-difm' );
	} );

	it( 'should call updateMigrationStatus with correct value for DIY option', () => {
		const { getByText } = render( { navigation: { submit: mockSubmit } } );

		const optionButton = getByText( "I'll do it myself" );
		fireEvent.click( optionButton );

		// Check the last call value
		const lastCallValue =
			mockUpdateMigrationStatus.mock.calls[ mockUpdateMigrationStatus.mock.calls.length - 1 ][ 1 ];
		expect( lastCallValue ).toBe( 'migration-pending-diy' );
	} );

	it( 'should call submit with correct value when DIFM option is clicked', () => {
		const { getByText } = render( { navigation: { submit: mockSubmit } } );

		const optionButton = getByText( 'Do it for me' );
		fireEvent.click( optionButton );

		expect( mockSubmit ).toHaveBeenCalledWith( { destination: 'upgrade', how: 'difm' } );
	} );

	it( 'should call submit with correct value for DIY option', () => {
		const { getByText } = render( { navigation: { submit: mockSubmit } } );

		const optionButton = getByText( "I'll do it myself" );
		fireEvent.click( optionButton );

		expect( mockSubmit ).toHaveBeenCalledWith( { destination: 'upgrade', how: 'myself' } );
	} );
} );
