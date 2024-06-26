/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import SiteMigrationImportOrMigrate from '..';
import { StepProps } from '../../../types';
import { renderStep, mockStepProps } from '../../test/helpers';

const render = ( props?: Partial< StepProps > ) => {
	const combinedProps = { ...mockStepProps( props ) };
	return renderStep( <SiteMigrationImportOrMigrate { ...combinedProps } /> );
};

jest.mock( 'calypso/landing/stepper/hooks/use-site' );

( useSite as jest.Mock ).mockReturnValue( {
	plan: { features: { active: [ 'install-plugins' ] } },
} );
describe( 'Site Migration Import or Migrate Step', () => {
	it( 'renders the migration options', () => {
		render();

		expect( screen.getByRole( 'heading', { name: /Migrate site/ } ) ).toBeVisible();
		expect( screen.getByRole( 'heading', { name: /Import content only/ } ) ).toBeVisible();
	} );

	it( 'starts the import flow when the user selects the "Import content only" option', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		await userEvent.click( screen.getByRole( 'heading', { name: /Import content only/ } ) );

		expect( submit ).toHaveBeenCalledWith( { destination: 'import' } );
	} );

	it( 'starts the migration only when the user selects the "Migrate site" option', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		await userEvent.click( screen.getByRole( 'heading', { name: /Migrate site/ } ) );

		expect( submit ).toHaveBeenCalledWith( { destination: 'migrate' } );
	} );

	it( 'starts the upgrade flow when the current site can NOT install plugins', async () => {
		( useSite as jest.Mock ).mockReturnValue( {
			plan: { features: { active: [] } },
		} );
		const submit = jest.fn();
		render( { navigation: { submit } } );

		await userEvent.click( screen.getByRole( 'heading', { name: /Migrate site/ } ) );

		expect( submit ).toHaveBeenCalledWith( { destination: 'upgrade' } );
	} );
} );
