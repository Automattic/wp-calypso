/**
 * @jest-environment jsdom
 */
import { fireEvent, render } from '@testing-library/react';
import { StepAddMigrationKey } from '../step-add-migration-key';

const fromUrl = 'https://mytestsite.com';
const migrationKey = '123';
const onDoneClick = jest.fn();
const preparationError = null;
const props = {
	fromUrl,
	migrationKey,
	onDoneClick,
	preparationError,
};

describe( 'StepAddMigrationKey', () => {
	it( 'should render the "Enter key" button', () => {
		const { getByRole } = render( <StepAddMigrationKey { ...props } /> );

		expect( getByRole( 'button', { name: /Enter key/ } ) ).toBeInTheDocument();
	} );

	it( 'should render the "Done" button', () => {
		const { getByRole } = render( <StepAddMigrationKey { ...props } /> );

		expect( getByRole( 'button', { name: /Done/ } ) ).toBeInTheDocument();
	} );

	it( 'should not render the "Enter key" button if the migration key is not set', () => {
		const newProps = {
			fromUrl,
			migrationKey: '',
			onDoneClick,
			preparationError,
		};
		const { queryByRole } = render( <StepAddMigrationKey { ...newProps } /> );

		expect( queryByRole( 'button', { name: /Enter key/ } ) ).not.toBeInTheDocument();
	} );

	it( 'should not render the "Done" button if the migration key is not set', () => {
		const newProps = {
			fromUrl,
			migrationKey: '',
			onDoneClick,
			preparationError,
		};
		const { queryByRole } = render( <StepAddMigrationKey { ...newProps } /> );

		expect( queryByRole( 'button', { name: /Done/ } ) ).not.toBeInTheDocument();
	} );

	it( 'should open the Migrate Guru plugin page in a new tab when the "Enter key" button is clicked', () => {
		const { getByRole } = render( <StepAddMigrationKey { ...props } /> );

		window.open = jest.fn();
		fireEvent.click( getByRole( 'button', { name: /Enter key/ } ) );

		expect( window.open ).toHaveBeenCalledWith(
			`${ fromUrl }/wp-admin/admin.php?page=migrateguru`,
			'_blank'
		);
	} );

	it( 'should call "onDoneClick" function prop when the "Done" button is clicked', () => {
		const { getByRole } = render( <StepAddMigrationKey { ...props } /> );

		fireEvent.click( getByRole( 'button', { name: /Done/ } ) );

		expect( onDoneClick ).toHaveBeenCalled();
	} );
} );
