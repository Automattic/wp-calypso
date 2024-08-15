/**
 * @jest-environment jsdom
 */
import { fireEvent, render } from '@testing-library/react';
import { StepInstallMigrateGuru } from '../step-install-migrate-guru';

const fromUrl = 'https://mytestsite.com';
const onNextClick = jest.fn();
const props = {
	fromUrl,
	onNextClick,
};

describe( 'StepInstallMigrateGuru', () => {
	it( 'should render the "Install plugin" button', () => {
		const { getByRole } = render( <StepInstallMigrateGuru { ...props } /> );

		expect( getByRole( 'button', { name: /Install plugin/ } ) ).toBeInTheDocument();
	} );

	it( 'should render the "Next" button', () => {
		const { getByRole } = render( <StepInstallMigrateGuru { ...props } /> );

		expect( getByRole( 'button', { name: /Next/ } ) ).toBeInTheDocument();
	} );

	it( 'should open the Migrate Guru plugin installation screen in a new tab when the "Install plugin" button is clicked', () => {
		const { getByRole } = render( <StepInstallMigrateGuru { ...props } /> );

		window.open = jest.fn();
		fireEvent.click( getByRole( 'button', { name: /Install plugin/ } ) );

		expect( window.open ).toHaveBeenCalledWith(
			`${ fromUrl }/wp-admin/plugin-install.php?s=%2522migrate%2520guru%2522&tab=search&type=term`,
			'_blank'
		);
	} );

	it( 'should call "onNextClick" function prop when the "Next" button is clicked', () => {
		const { getByRole } = render( <StepInstallMigrateGuru { ...props } /> );

		fireEvent.click( getByRole( 'button', { name: /Next/ } ) );

		expect( onNextClick ).toHaveBeenCalled();
	} );
} );
