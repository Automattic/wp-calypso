/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import EducationStudentValidation from '..';
import { StepProps } from '../../../types';
import { mockStepProps, renderStep } from '../../test/helpers';

jest.mock( 'calypso/lib/analytics/tracks' );

const mockApi = () => nock( 'https://public-api.wordpress.com:443' );

const render = ( props?: Partial< StepProps > ) => {
	const queryClient = new QueryClient( {
		defaultOptions: {
			queries: {
				retry: false,
			},
			mutations: {
				retry: false,
			},
		},
	} );
	const combinedProps = mockStepProps( {
		stepName: 'education-student-validation',
		flow: 'education',
		...props,
	} );

	return renderStep(
		<QueryClientProvider client={ queryClient }>
			<EducationStudentValidation { ...combinedProps } />
		</QueryClientProvider>
	);
};

describe( 'EducationStudentValidation', () => {
	beforeAll( () => nock.disableNetConnect() );

	afterEach( () => {
		jest.clearAllMocks();
		nock.cleanAll();
	} );

	afterAll( () => nock.enableNetConnect() );

	it( 'renders the invite code form', () => {
		render();

		expect(
			screen.getByRole( 'heading', {
				name: 'Welcome to the WordPress.com Education Program',
			} )
		).toBeVisible();
		expect( screen.getByLabelText( 'Invitation code' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Validate invite code' } ) ).toBeDisabled();
		expect(
			screen.getByRole( 'link', { name: 'Learn more about the program at wp.com/edu' } )
		).toHaveAttribute( 'href', 'https://wp.com/edu' );
	} );

	it( 'validates the code and submits only the validation marker', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		const validationRequest = mockApi()
			.post( '/wpcom/v2/me/education-student-validation', { code: 'EDU-123' } )
			.reply( 200, { success: true } );

		await userEvent.type( screen.getByLabelText( 'Invitation code' ), '  EDU-123  ' );
		await userEvent.click( screen.getByRole( 'button', { name: 'Validate invite code' } ) );

		await waitFor( () => {
			expect( submit ).toHaveBeenCalledWith( { inviteCodeValidated: true } );
		} );
		expect( submit ).not.toHaveBeenCalledWith( expect.objectContaining( { code: 'EDU-123' } ) );
		expect( validationRequest.isDone() ).toBe( true );
	} );

	it( 'shows an error and records a Tracks event when the code is rejected', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		mockApi()
			.post( '/wpcom/v2/me/education-student-validation', { code: 'UNKNOWN' } )
			.reply( 400, { code: 'invalid_education_student_code' } );

		await userEvent.type( screen.getByLabelText( 'Invitation code' ), 'UNKNOWN' );
		await userEvent.click( screen.getByRole( 'button', { name: 'Validate invite code' } ) );

		expect( await screen.findByText( 'Invitation code not found' ) ).toBeVisible();
		expect( submit ).not.toHaveBeenCalled();
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_education_student_validation_failed',
			{ flow: 'education', reason: 'invalid' }
		);
	} );

	it( 'shows a rate limit error when the API returns 429', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		mockApi()
			.post( '/wpcom/v2/me/education-student-validation', { code: 'HAMMERED' } )
			.reply( 429, { code: 'rate_limit_exceeded' } );

		await userEvent.type( screen.getByLabelText( 'Invitation code' ), 'HAMMERED' );
		await userEvent.click( screen.getByRole( 'button', { name: 'Validate invite code' } ) );

		expect(
			await screen.findByText( 'Too many attempts. Please wait a moment and try again.' )
		).toBeVisible();
		expect( submit ).not.toHaveBeenCalled();
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_education_student_validation_failed',
			{ flow: 'education', reason: 'rate_limited' }
		);
	} );

	it( 'shows a generic error when the API fails', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		mockApi()
			.post( '/wpcom/v2/me/education-student-validation', { code: 'ANYCODE' } )
			.reply( 500, { code: 'internal_server_error' } );

		await userEvent.type( screen.getByLabelText( 'Invitation code' ), 'ANYCODE' );
		await userEvent.click( screen.getByRole( 'button', { name: 'Validate invite code' } ) );

		expect( await screen.findByText( 'Something went wrong. Please try again.' ) ).toBeVisible();
		expect( submit ).not.toHaveBeenCalled();
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_education_student_validation_failed',
			{ flow: 'education', reason: 'unknown' }
		);
	} );

	it( 'shows an error when the code resolves with success: false', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		mockApi()
			.post( '/wpcom/v2/me/education-student-validation', { code: 'ARCHIVED' } )
			.reply( 200, { success: false } );

		await userEvent.type( screen.getByLabelText( 'Invitation code' ), 'ARCHIVED' );
		await userEvent.click( screen.getByRole( 'button', { name: 'Validate invite code' } ) );

		expect( await screen.findByText( 'Invitation code not found' ) ).toBeVisible();
		expect( submit ).not.toHaveBeenCalled();
	} );

	it( 'keeps the code retryable after a rejection and clears the error on edit', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		mockApi()
			.post( '/wpcom/v2/me/education-student-validation', { code: 'UNKNOWN' } )
			.reply( 400, { code: 'invalid_education_student_code' } );

		await userEvent.type( screen.getByLabelText( 'Invitation code' ), 'UNKNOWN' );
		await userEvent.click( screen.getByRole( 'button', { name: 'Validate invite code' } ) );

		expect( await screen.findByText( 'Invitation code not found' ) ).toBeVisible();
		// The same code stays submittable so a transient failure isn't a dead end.
		expect( screen.getByRole( 'button', { name: 'Validate invite code' } ) ).toBeEnabled();

		await userEvent.type( screen.getByLabelText( 'Invitation code' ), 'X' );

		expect( screen.queryByText( 'Invitation code not found' ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Validate invite code' } ) ).toBeEnabled();
	} );
} );
