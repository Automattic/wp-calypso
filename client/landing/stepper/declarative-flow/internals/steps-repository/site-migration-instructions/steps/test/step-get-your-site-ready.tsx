/**
 * @jest-environment jsdom
 */
import { fireEvent, render } from '@testing-library/react';
import { StepGetYourSiteReady } from '../step-get-your-site-ready';

const fromUrl = 'https://mytestsite.com';
const onNextClick = jest.fn();
const props = {
	fromUrl,
	onNextClick,
};

describe( 'StepGetYourSiteReady', () => {
	it( 'should render the "Get started" button', () => {
		const { getByRole } = render( <StepGetYourSiteReady { ...props } /> );

		expect( getByRole( 'button', { name: /Get started/ } ) ).toBeInTheDocument();
	} );

	it( 'should render the "Next" button', () => {
		const { getByRole } = render( <StepGetYourSiteReady { ...props } /> );

		expect( getByRole( 'button', { name: /Next/ } ) ).toBeInTheDocument();
	} );

	it( 'should open the Migrate Guru plugin page in a new tab when the "Get started" button is clicked', () => {
		const { getByRole } = render( <StepGetYourSiteReady { ...props } /> );

		window.open = jest.fn();
		fireEvent.click( getByRole( 'button', { name: /Get started/ } ) );

		expect( window.open ).toHaveBeenCalledWith(
			`${ fromUrl }/wp-admin/admin.php?page=migrateguru`,
			'_blank'
		);
	} );

	it( 'should call "onNextClick" function prop when the "Next" button is clicked', () => {
		const { getByRole } = render( <StepGetYourSiteReady { ...props } /> );

		fireEvent.click( getByRole( 'button', { name: /Next/ } ) );

		expect( onNextClick ).toHaveBeenCalled();
	} );
} );
