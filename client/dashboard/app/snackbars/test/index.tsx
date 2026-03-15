/**
 * @jest-environment jsdom
 */

import { useQueryClient } from '@tanstack/react-query';
import { act, render } from '@testing-library/react';
import { useSelect, useDispatch } from '@wordpress/data';
import Snackbars from '../index';

const mockCreateSuccessNotice = jest.fn();
const mockCreateErrorNotice = jest.fn();
const mockRemoveNotice = jest.fn();
type MutationEvent = {
	type: 'updated';
	action: {
		type: 'success' | 'error';
		error?: Error;
	};
	mutation: {
		meta?: {
			snackbar?: {
				success?: string;
				error?: string | { source: 'server' };
			};
		};
	};
};

let subscriptionCallback: ( event: MutationEvent ) => void;
let hasSubscription = false;

jest.mock( '@wordpress/data', () => ( {
	useSelect: jest.fn(),
	useDispatch: jest.fn(),
} ) );

jest.mock( '@tanstack/react-query', () => ( {
	useQueryClient: jest.fn(),
} ) );

jest.mock( '@wordpress/components', () => ( {
	SnackbarList: jest.fn( () => null ),
} ) );

jest.mock( '@wordpress/notices', () => ( {
	store: {},
} ) );

const mockedUseSelect = useSelect as jest.Mock;
const mockedUseDispatch = useDispatch as jest.Mock;
const mockedUseQueryClient = useQueryClient as jest.Mock;

describe( 'Snackbars', () => {
	let currentNotices: Array< {
		id: string;
		type: string;
		status?: string;
		content?: string;
	} >;
	let mockSubscribe: jest.Mock;

	beforeEach( () => {
		hasSubscription = false;

		currentNotices = [
			{
				id: 'existing-snackbar',
				type: 'snackbar',
				status: 'success',
				content: 'Existing notice',
			},
		];

		mockedUseSelect.mockImplementation( () => currentNotices );

		mockedUseDispatch.mockImplementation( () => ( {
			removeNotice: mockRemoveNotice,
			createSuccessNotice: mockCreateSuccessNotice,
			createErrorNotice: mockCreateErrorNotice,
		} ) );

		mockSubscribe = jest.fn( ( callback: ( event: MutationEvent ) => void ) => {
			subscriptionCallback = callback;
			hasSubscription = true;
			return jest.fn();
		} );

		mockedUseQueryClient.mockReturnValue( {
			getMutationCache: () => ( {
				subscribe: mockSubscribe,
			} ),
		} );
	} );

	test( 'creates success snackbar when mutation meta includes a success message', () => {
		render( <Snackbars /> );

		expect( mockSubscribe ).toHaveBeenCalledTimes( 1 );
		if ( ! hasSubscription ) {
			throw new Error( 'Expected mutation cache subscription callback to be registered.' );
		}

		const successEvent: MutationEvent = {
			type: 'updated',
			action: { type: 'success' },
			mutation: {
				meta: {
					snackbar: {
						success: 'Operation completed.',
					},
				},
			},
		};

		act( () => subscriptionCallback( successEvent ) );

		expect( mockCreateSuccessNotice ).toHaveBeenCalledWith( 'Operation completed.', {
			type: 'snackbar',
		} );
		expect( mockCreateErrorNotice ).not.toHaveBeenCalled();
	} );

	test( 'surfaces server error messages when requested by mutation meta', () => {
		render( <Snackbars /> );

		expect( mockSubscribe ).toHaveBeenCalledTimes( 1 );
		if ( ! hasSubscription ) {
			throw new Error( 'Expected mutation cache subscription callback to be registered.' );
		}

		const serverError = new Error( 'Server rejected the request.' );
		const errorEvent: MutationEvent = {
			type: 'updated',
			action: {
				type: 'error',
				error: serverError,
			},
			mutation: {
				meta: {
					snackbar: {
						error: { source: 'server' },
					},
				},
			},
		};

		act( () => subscriptionCallback( errorEvent ) );

		expect( mockCreateErrorNotice ).toHaveBeenCalledWith( 'Server rejected the request.', {
			type: 'snackbar',
		} );
		expect( mockCreateSuccessNotice ).not.toHaveBeenCalled();
	} );

	test( 'uses snackbar error string when provided directly by mutation meta', () => {
		render( <Snackbars /> );

		expect( mockSubscribe ).toHaveBeenCalledTimes( 1 );
		if ( ! hasSubscription ) {
			throw new Error( 'Expected mutation cache subscription callback to be registered.' );
		}

		const errorEvent: MutationEvent = {
			type: 'updated',
			action: {
				type: 'error',
				error: new Error( 'Server rejected the request.' ),
			},
			mutation: {
				meta: {
					snackbar: {
						error: 'Custom snackbar error.',
					},
				},
			},
		};

		act( () => subscriptionCallback( errorEvent ) );

		expect( mockCreateErrorNotice ).toHaveBeenCalledWith( 'Custom snackbar error.', {
			type: 'snackbar',
		} );
	} );
} );
