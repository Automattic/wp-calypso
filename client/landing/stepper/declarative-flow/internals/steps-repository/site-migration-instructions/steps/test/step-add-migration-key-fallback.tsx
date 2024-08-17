/**
 * @jest-environment jsdom
 */
import { fireEvent, render } from '@testing-library/react';
import { StepAddMigrationKeyFallback } from '../step-add-migration-key-fallback';

const onDoneClick = jest.fn();
const props = { onDoneClick };
const siteUrl = 'staging.wordpress.com';

jest.mock( 'calypso/landing/stepper/hooks/use-site', () => ( {
	useSite: () => ( { URL: siteUrl } ),
} ) );

describe( 'StepAddMigrationKeyFallback', () => {
	it( 'should render the "Get the key" button', () => {
		const { getByRole } = render( <StepAddMigrationKeyFallback { ...props } /> );

		expect( getByRole( 'button', { name: /Get the key/ } ) ).toBeInTheDocument();
	} );

	it( 'should render the "Done" button', () => {
		const { getByRole } = render( <StepAddMigrationKeyFallback { ...props } /> );

		expect( getByRole( 'button', { name: /Done/ } ) ).toBeInTheDocument();
	} );

	it( 'should open the Migrate Guru plugin page in a new tab when the "Get the key" button is clicked', () => {
		const { getByRole } = render( <StepAddMigrationKeyFallback { ...props } /> );

		window.open = jest.fn();
		fireEvent.click( getByRole( 'button', { name: /Get the key/ } ) );

		expect( window.open ).toHaveBeenCalledWith(
			`${ siteUrl }/wp-admin/admin.php?page=migrateguru`,
			'_blank'
		);
	} );

	it( 'should call "onDoneClick" function prop when the "Done" button is clicked', () => {
		const { getByRole } = render( <StepAddMigrationKeyFallback { ...props } /> );

		fireEvent.click( getByRole( 'button', { name: /Done/ } ) );

		expect( onDoneClick ).toHaveBeenCalled();
	} );
} );
