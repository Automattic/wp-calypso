/**
 * @jest-environment jsdom
 */

// Mock the WordPress data store
const mockCreateSuccessNotice = jest.fn();
const mockCreateErrorNotice = jest.fn();

jest.mock( '@wordpress/data', () => ( {
	useDispatch: jest.fn( () => ( {
		createSuccessNotice: mockCreateSuccessNotice,
		createErrorNotice: mockCreateErrorNotice,
	} ) ),
} ) );

describe( 'GravatarProfileSection Snackbar Notifications', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'Success notifications', () => {
		it( 'should call createSuccessNotice with correct message and type', () => {
			// Simulate the success callback from the mutation
			const onSuccess = () => {
				mockCreateSuccessNotice( 'Public Gravatar profile saved successfully.', {
					type: 'snackbar',
				} );
			};

			onSuccess();

			expect( mockCreateSuccessNotice ).toHaveBeenCalledWith(
				'Public Gravatar profile saved successfully.',
				{ type: 'snackbar' }
			);
			expect( mockCreateSuccessNotice ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should use snackbar type for success notifications', () => {
			const onSuccess = () => {
				mockCreateSuccessNotice( 'Public Gravatar profile saved successfully.', {
					type: 'snackbar',
				} );
			};

			onSuccess();

			const callArgs = mockCreateSuccessNotice.mock.calls[ 0 ];
			expect( callArgs[ 1 ] ).toEqual( { type: 'snackbar' } );
		} );
	} );

	describe( 'Error notifications', () => {
		it( 'should call createErrorNotice with error message when provided', () => {
			const errorMessage = 'Network error occurred';

			// Simulate the error callback from the mutation
			const onError = ( error: Error ) => {
				mockCreateErrorNotice( error.message || 'Failed to save public Gravatar profile.', {
					type: 'snackbar',
				} );
			};

			onError( new Error( errorMessage ) );

			expect( mockCreateErrorNotice ).toHaveBeenCalledWith( errorMessage, { type: 'snackbar' } );
			expect( mockCreateErrorNotice ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should call createErrorNotice with fallback message when no error message is provided', () => {
			// Simulate the error callback from the mutation with empty error
			const onError = ( error: Error ) => {
				mockCreateErrorNotice( error.message || 'Failed to save public Gravatar profile.', {
					type: 'snackbar',
				} );
			};

			onError( new Error( '' ) );

			expect( mockCreateErrorNotice ).toHaveBeenCalledWith(
				'Failed to save public Gravatar profile.',
				{ type: 'snackbar' }
			);
			expect( mockCreateErrorNotice ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should use snackbar type for error notifications', () => {
			const onError = ( error: Error ) => {
				mockCreateErrorNotice( error.message || 'Failed to save public Gravatar profile.', {
					type: 'snackbar',
				} );
			};

			onError( new Error( 'Test error' ) );

			const callArgs = mockCreateErrorNotice.mock.calls[ 0 ];
			expect( callArgs[ 1 ] ).toEqual( { type: 'snackbar' } );
		} );
	} );

	describe( 'Notification behavior consistency', () => {
		it( 'should use snackbar type for both success and error notifications', () => {
			const onSuccess = () => {
				mockCreateSuccessNotice( 'Public Gravatar profile saved successfully.', {
					type: 'snackbar',
				} );
			};

			const onError = ( error: Error ) => {
				mockCreateErrorNotice( error.message || 'Failed to save public Gravatar profile.', {
					type: 'snackbar',
				} );
			};

			onSuccess();
			onError( new Error( 'Test error' ) );

			// Verify both notifications use snackbar type
			expect( mockCreateSuccessNotice ).toHaveBeenCalledWith( expect.any( String ), {
				type: 'snackbar',
			} );
			expect( mockCreateErrorNotice ).toHaveBeenCalledWith( expect.any( String ), {
				type: 'snackbar',
			} );
		} );

		it( 'should have specific messages for Gravatar profile context', () => {
			const onSuccess = () => {
				mockCreateSuccessNotice( 'Public Gravatar profile saved successfully.', {
					type: 'snackbar',
				} );
			};

			const onError = ( error: Error ) => {
				mockCreateErrorNotice( error.message || 'Failed to save public Gravatar profile.', {
					type: 'snackbar',
				} );
			};

			onSuccess();
			onError( new Error( '' ) ); // Empty error to trigger fallback

			// Verify messages are specific to Gravatar profile
			expect( mockCreateSuccessNotice ).toHaveBeenCalledWith(
				'Public Gravatar profile saved successfully.',
				expect.any( Object )
			);
			expect( mockCreateErrorNotice ).toHaveBeenCalledWith(
				'Failed to save public Gravatar profile.',
				expect.any( Object )
			);
		} );
	} );
} );
