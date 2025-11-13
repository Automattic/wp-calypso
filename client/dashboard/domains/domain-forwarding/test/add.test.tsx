/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import DomainForwardingForm from '../form';
import type { FormData } from '../form';

const domainName = 'example.com';

interface TestFormProps {
	forceSubdomain?: boolean;
	initialData?: any;
	onSubmit?: ( data: FormData ) => void;
	isSubmitting?: boolean;
	submitButtonText?: string;
}

function renderForm( props: TestFormProps = {} ) {
	const defaultProps = {
		domainName,
		onSubmit: jest.fn(),
		isSubmitting: false,
		submitButtonText: 'Add',
		forceSubdomain: false,
		...props,
	};

	return render( <DomainForwardingForm { ...defaultProps } /> );
}

afterEach( () => nock.cleanAll() );

test( 'renders domain forwarding form with correct fields', async () => {
	renderForm();

	await waitFor( () => {
		expect( screen.getByText( /Target URL/ ) ).toBeInTheDocument();
	} );

	expect( screen.getByText( 'Type' ) ).toBeInTheDocument();
	expect( screen.getByText( /Source URL/ ) ).toBeInTheDocument();
	expect( screen.getByRole( 'button', { name: 'Add' } ) ).toBeInTheDocument();
} );

test( 'hides source URL selector when forceSubdomain is true', async () => {
	renderForm( { forceSubdomain: true } );

	await waitFor( () => {
		expect( screen.getByText( /Target URL/ ) ).toBeInTheDocument();
	} );

	// Should not show the source type selector when forceSubdomain is true
	expect( screen.queryByText( 'Type' ) ).not.toBeInTheDocument();
	expect( screen.getByText( /Source URL/ ) ).toBeInTheDocument();
} );

test( 'shows both root domain and subdomain options when forceSubdomain is false', async () => {
	renderForm( { forceSubdomain: false } );

	await waitFor( () => {
		expect( screen.getByText( /Target URL/ ) ).toBeInTheDocument();
	} );

	// Should show the source type selector when forceSubdomain is false
	expect( screen.getByText( 'Type' ) ).toBeInTheDocument();
} );

test( 'calls onSubmit with correct data when form is submitted', async () => {
	const user = userEvent.setup();
	const mockOnSubmit = jest.fn();

	renderForm( { onSubmit: mockOnSubmit } );

	await waitFor( () => {
		expect( screen.getByText( /Target URL/ ) ).toBeInTheDocument();
	} );

	// Fill in the subdomain field (default sourceType is empty '' meaning subdomain)
	const subdomainInput = screen.getByRole( 'textbox', { name: /source url/i } );
	await user.type( subdomainInput, 'blog' );

	// Fill in the target URL
	const targetUrlInput = screen.getByRole( 'textbox', { name: /target url/i } );
	await user.type( targetUrlInput, 'https://newsite.com' );

	// Submit the form
	const submitButton = screen.getByRole( 'button', { name: 'Add' } );
	await user.click( submitButton );

	// Verify onSubmit was called with the correct data
	expect( mockOnSubmit ).toHaveBeenCalledWith( {
		sourceType: '',
		subdomain: 'blog',
		targetUrl: 'https://newsite.com',
		isPermanent: false,
		forwardPaths: false,
	} );
} );

test( 'disables submit button when isSubmitting is true', async () => {
	renderForm( { isSubmitting: true } );

	await waitFor( () => {
		expect( screen.getByText( /Target URL/ ) ).toBeInTheDocument();
	} );

	const submitButton = screen.getByRole( 'button', { name: 'Add' } );
	expect( submitButton ).toBeDisabled();
} );

test( 'shows advanced settings panel', async () => {
	const user = userEvent.setup();
	renderForm();

	await waitFor( () => {
		expect( screen.getByText( /Target URL/ ) ).toBeInTheDocument();
	} );

	// Advanced settings panel should be present
	expect( screen.getByText( 'Advanced settings' ) ).toBeInTheDocument();

	// Click to expand if needed
	const advancedPanel = screen.getByText( 'Advanced settings' );
	await user.click( advancedPanel );

	await waitFor( () => {
		expect( screen.getByText( 'HTTP redirect type' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Path forwarding' ) ).toBeInTheDocument();
	} );
} );

test( 'shows validation error when subdomain starts with dash and is blurred', async () => {
	const user = userEvent.setup();

	renderForm();

	await waitFor( () => {
		expect( screen.getByText( /Target URL/ ) ).toBeInTheDocument();
	} );

	// Fill in an invalid subdomain starting with dash and blur
	const subdomainInput = screen.getByRole( 'textbox', { name: /source url/i } );
	await user.type( subdomainInput, '-invalid' );
	await user.tab(); // This will blur the field

	// Validation error should appear after blur
	await waitFor( () => {
		expect( screen.getByText( /subdomain should be a valid domain label/i ) ).toBeInTheDocument();
	} );
} );

test( 'shows validation error when target URL is empty and blurred', async () => {
	const user = userEvent.setup();

	renderForm();

	await waitFor( () => {
		expect( screen.getByText( /Target URL/ ) ).toBeInTheDocument();
	} );

	// Fill in a valid subdomain
	const subdomainInput = screen.getByRole( 'textbox', { name: /source url/i } );
	await user.type( subdomainInput, 'blog' );

	// Focus on target URL field but leave it empty, then blur
	const targetUrlInput = screen.getByRole( 'textbox', { name: /target url/i } );
	await user.click( targetUrlInput );
	await user.tab(); // This will blur the field

	// Validation error should appear after blur
	// Note: jsdom uses "Constraints not satisfied" while browsers use locale-specific messages like "Please fill out this field"
	await waitFor( () => {
		expect( screen.getByText( /constraints not satisfied/i ) ).toBeInTheDocument();
	} );
} );

test( 'shows validation error when target URL is invalid and blurred', async () => {
	const user = userEvent.setup();

	renderForm();

	await waitFor( () => {
		expect( screen.getByText( /Target URL/ ) ).toBeInTheDocument();
	} );

	// Fill in a valid subdomain
	const subdomainInput = screen.getByRole( 'textbox', { name: /source url/i } );
	await user.type( subdomainInput, 'blog' );

	// Fill in an invalid target URL and blur
	const targetUrlInput = screen.getByRole( 'textbox', { name: /target url/i } );
	await user.type( targetUrlInput, 'not a valid url' );
	await user.tab(); // This will blur the field

	// Validation error should appear after blur
	await waitFor( () => {
		expect( screen.getByText( /please enter a valid url/i ) ).toBeInTheDocument();
	} );
} );

test( 'shows validation error when target URL redirects to same domain without path', async () => {
	const user = userEvent.setup();

	renderForm();

	await waitFor( () => {
		expect( screen.getByText( /Target URL/ ) ).toBeInTheDocument();
	} );

	// Fill in a valid subdomain
	const subdomainInput = screen.getByRole( 'textbox', { name: /source url/i } );
	await user.type( subdomainInput, 'blog' );

	// Fill in target URL that points to same domain (which is not allowed) and blur
	const targetUrlInput = screen.getByRole( 'textbox', { name: /target url/i } );
	await user.type( targetUrlInput, 'https://example.com' );
	await user.tab(); // This will blur the field

	// Validation error should appear after blur
	await waitFor( () => {
		expect( screen.getByText( /please enter a valid url/i ) ).toBeInTheDocument();
	} );
} );

test( 'allows target URL that redirects to same domain with path', async () => {
	const user = userEvent.setup();
	const mockOnSubmit = jest.fn();

	renderForm( { onSubmit: mockOnSubmit } );

	await waitFor( () => {
		expect( screen.getByText( /Target URL/ ) ).toBeInTheDocument();
	} );

	// Fill in a valid subdomain
	const subdomainInput = screen.getByRole( 'textbox', { name: /source url/i } );
	await user.type( subdomainInput, 'blog' );

	// Fill in target URL that points to same domain with path (which is allowed)
	const targetUrlInput = screen.getByRole( 'textbox', { name: /target url/i } );
	await user.type( targetUrlInput, 'https://example.com/blog' );

	// Submit the form
	const submitButton = screen.getByRole( 'button', { name: 'Add' } );
	await user.click( submitButton );

	// Should submit successfully without validation error
	await waitFor( () => {
		expect( mockOnSubmit ).toHaveBeenCalledWith( {
			sourceType: '',
			subdomain: 'blog',
			targetUrl: 'https://example.com/blog',
			isPermanent: false,
			forwardPaths: false,
		} );
	} );
} );

test( 'allows target URL without protocol (normalizes input)', async () => {
	const user = userEvent.setup();
	const mockOnSubmit = jest.fn();

	renderForm( { onSubmit: mockOnSubmit } );

	await waitFor( () => {
		expect( screen.getByText( /Target URL/ ) ).toBeInTheDocument();
	} );

	// Fill in a valid subdomain
	const subdomainInput = screen.getByRole( 'textbox', { name: /source url/i } );
	await user.type( subdomainInput, 'blog' );

	// Fill in target URL without protocol
	const targetUrlInput = screen.getByRole( 'textbox', { name: /target url/i } );
	await user.type( targetUrlInput, 'newsite.com' );

	// Submit the form
	const submitButton = screen.getByRole( 'button', { name: 'Add' } );
	await user.click( submitButton );

	// Should submit successfully - the URL gets normalized during form processing
	await waitFor( () => {
		expect( mockOnSubmit ).toHaveBeenCalledWith(
			expect.objectContaining( {
				sourceType: '',
				subdomain: 'blog',
				targetUrl: 'newsite.com', // Input as typed by user
				isPermanent: false,
				forwardPaths: false,
			} )
		);
	} );
} );

test( 'pre-fills form with initial data when provided', async () => {
	const initialData = {
		domain_redirect_id: 123,
		subdomain: 'blog',
		target_host: 'newsite.com',
		target_path: '/path',
		is_secure: true,
		is_permanent: false,
		forward_paths: true,
	};

	renderForm( {
		initialData,
		submitButtonText: 'Update',
	} );

	await waitFor( () => {
		expect( screen.getByDisplayValue( 'blog' ) ).toBeInTheDocument();
		expect( screen.getByDisplayValue( 'https://newsite.com/path' ) ).toBeInTheDocument();
	} );

	expect( screen.getByRole( 'button', { name: 'Update' } ) ).toBeInTheDocument();
} );
