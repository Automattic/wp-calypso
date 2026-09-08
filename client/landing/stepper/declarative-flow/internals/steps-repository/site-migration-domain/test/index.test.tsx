/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SiteMigrationDomain from '..';
import { StepProps } from '../../../types';
import { mockStepProps, renderStep, RenderStepOptions } from '../../test/helpers';

const mockGetFlowState = jest.fn();

jest.mock( 'calypso/landing/stepper/declarative-flow/internals/state-manager/store', () => ( {
	useFlowState: () => ( { get: mockGetFlowState, set: jest.fn() } ),
} ) );

const render = ( props?: Partial< StepProps >, renderOptions?: RenderStepOptions ) => {
	const combinedProps = { ...mockStepProps( props ) };

	return renderStep( <SiteMigrationDomain { ...combinedProps } />, {
		initialEntry: '/some-path?from=https://terraandtwine.com',
		...renderOptions,
	} );
};

const getContinueButton = () => screen.getByRole( 'button', { name: 'Continue' } );

describe( 'SiteMigrationDomain', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockGetFlowState.mockReturnValue( undefined );
	} );

	it( 'offers the source domain read from the from parameter', () => {
		render( { navigation: { submit: jest.fn() } } );

		expect( screen.getByRole( 'radio', { name: 'Keep terraandtwine.com' } ) ).toBeChecked();
		expect( screen.getByText( 'Recommended' ) ).toBeVisible();
		expect( screen.getByText( /Needs any paid plan/ ) ).toBeVisible();
		expect(
			screen.getByRole( 'radio', { name: 'Use terraandtwine.wordpress.com' } )
		).toBeVisible();
	} );

	it( 'prefers the host found by the scan', () => {
		mockGetFlowState.mockReturnValue( { analysis: { site: { host: 'scanned.example' } } } );

		render( { navigation: { submit: jest.fn() } } );

		expect( screen.getByRole( 'radio', { name: 'Keep scanned.example' } ) ).toBeVisible();
	} );

	it( 'submits the keep choice', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		await userEvent.click( getContinueButton() );

		expect( submit ).toHaveBeenCalledWith( { choice: 'keep' } );
	} );

	it( 'submits the free subdomain choice', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		await userEvent.click(
			screen.getByRole( 'radio', { name: 'Use terraandtwine.wordpress.com' } )
		);
		await userEvent.click( getContinueButton() );

		expect( submit ).toHaveBeenCalledWith( { choice: 'free-subdomain' } );
	} );

	it( 'submits the register choice', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		await userEvent.click( screen.getByRole( 'radio', { name: 'Register a new domain' } ) );
		await userEvent.click( getContinueButton() );

		expect( submit ).toHaveBeenCalledWith( { choice: 'register' } );
	} );

	it( 'falls back to a free address when there is no source domain', () => {
		render( { navigation: { submit: jest.fn() } }, { initialEntry: '/some-path' } );

		expect( screen.getByRole( 'radio', { name: 'Keep your current domain' } ) ).toBeVisible();
		expect( screen.getByRole( 'radio', { name: 'Use yoursite.wordpress.com' } ) ).toBeChecked();
	} );

	it( 'shows its position in the migration wizard', () => {
		render( { navigation: { submit: jest.fn() } } );

		expect( screen.getByRole( 'progressbar', { name: 'Migration progress' } ) ).toHaveAttribute(
			'aria-valuetext',
			'Step 5 of 7: Domain'
		);
	} );
} );
