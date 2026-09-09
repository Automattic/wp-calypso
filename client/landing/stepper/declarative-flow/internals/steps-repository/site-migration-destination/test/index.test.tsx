/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SiteMigrationDestination from '..';
import { StepProps } from '../../../types';
import { mockStepProps, renderStep, RenderStepOptions } from '../../test/helpers';

const render = ( props?: Partial< StepProps >, renderOptions?: RenderStepOptions ) => {
	const combinedProps = { ...mockStepProps( props ) };

	return renderStep( <SiteMigrationDestination { ...combinedProps } />, renderOptions );
};

const getContinueButton = () => screen.getByRole( 'button', { name: 'Continue' } );

describe( 'SiteMigrationDestination', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'keeps continue disabled until a destination is picked', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		expect( getContinueButton() ).toBeDisabled();

		await userEvent.click( screen.getByRole( 'radio', { name: 'WordPress.com' } ) );

		expect( getContinueButton() ).toBeEnabled();
	} );

	it( 'submits the WordPress.com destination', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		await userEvent.click( screen.getByRole( 'radio', { name: 'WordPress.com' } ) );
		await userEvent.click( getContinueButton() );

		expect( submit ).toHaveBeenCalledWith( { destination: 'wpcom' } );
	} );

	it( 'submits the Space Fast destination', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		await userEvent.click( screen.getByRole( 'radio', { name: 'Space Fast' } ) );
		await userEvent.click( getContinueButton() );

		expect( submit ).toHaveBeenCalledWith( { destination: 'space-fast' } );
	} );

	it( 'shows the badges and the comparison table', () => {
		render( { navigation: { submit: jest.fn() } } );

		expect( screen.getByText( 'Most popular' ) ).toBeVisible();
		expect( screen.getByText( 'New' ) ).toBeVisible();
		expect( screen.getByRole( 'row', { name: /Editing/ } ) ).toBeVisible();
		expect( screen.getByText( 'Full block editor, themes, and plugins' ) ).toBeVisible();
		expect( screen.getByText( 'Edit the files you already have' ) ).toBeVisible();
	} );

	it( 'shows its position in the migration wizard', () => {
		render( { navigation: { submit: jest.fn() } } );

		expect( screen.getByRole( 'progressbar', { name: 'Migration progress' } ) ).toHaveAttribute(
			'aria-valuetext',
			'Step 2 of 5: Choose'
		);
	} );
} );
