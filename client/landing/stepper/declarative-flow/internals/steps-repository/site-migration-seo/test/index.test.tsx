/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SiteMigrationSeo from '..';
import { StepProps } from '../../../types';
import { mockStepProps, renderStep, RenderStepOptions } from '../../test/helpers';

const mockGetFlowState = jest.fn();

jest.mock( 'calypso/landing/stepper/declarative-flow/internals/state-manager/store', () => ( {
	useFlowState: () => ( { get: mockGetFlowState, set: jest.fn() } ),
} ) );

const render = ( props?: Partial< StepProps >, renderOptions?: RenderStepOptions ) => {
	const combinedProps = { ...mockStepProps( props ) };

	return renderStep( <SiteMigrationSeo { ...combinedProps } />, renderOptions );
};

describe( 'SiteMigrationSeo', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockGetFlowState.mockReturnValue( undefined );
	} );

	it( 'interpolates the counts found by the scan', () => {
		mockGetFlowState.mockReturnValue( {
			analysis: { counts: { pages: 12, posts: 8, images: 42 } },
		} );

		render( { navigation: { submit: jest.fn() } } );

		expect( mockGetFlowState ).toHaveBeenCalledWith( 'site-migration-scan' );
		expect( screen.getByText( 'All 12 URLs preserved' ) ).toBeVisible();
		expect( screen.getByText( 'All 42 images' ) ).toBeVisible();
	} );

	it( 'falls back to generic copy when the scan analysis is missing', () => {
		render( { navigation: { submit: jest.fn() } } );

		expect( screen.getByText( 'Every URL preserved' ) ).toBeVisible();
		expect( screen.getByText( 'All your images' ) ).toBeVisible();
	} );

	it( 'shows its position in the migration wizard', () => {
		render( { navigation: { submit: jest.fn() } } );

		expect( screen.getByRole( 'progressbar', { name: 'Migration progress' } ) ).toHaveAttribute(
			'aria-valuetext',
			'Step 6 of 7: SEO'
		);
	} );

	it( 'submits when continuing', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		await userEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );

		expect( submit ).toHaveBeenCalledWith( undefined );
	} );

	it( 'goes back to the previous step', async () => {
		const goBack = jest.fn();
		render( { navigation: { submit: jest.fn(), goBack } } );

		await userEvent.click( screen.getByRole( 'button', { name: 'Back' } ) );

		expect( goBack ).toHaveBeenCalled();
	} );
} );
