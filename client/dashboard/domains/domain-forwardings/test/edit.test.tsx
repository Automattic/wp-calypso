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
}

function renderEditForm( props: TestFormProps = {} ) {
	const defaultProps = {
		domainName,
		onSubmit: jest.fn(),
		isSubmitting: false,
		submitButtonText: 'Update',
		forceSubdomain: false,
		...props,
	};

	return render( <DomainForwardingForm { ...defaultProps } /> );
}

afterEach( () => nock.cleanAll() );

test.skip( 'renders edit form with pre-filled subdomain forwarding data', async () => {
	const initialData = {
		domain_redirect_id: 123,
		subdomain: 'blog',
		target_host: 'newsite.com',
		target_path: '/path',
		is_secure: true,
		is_permanent: false,
		forward_paths: true,
	};

	renderEditForm( { initialData } );

	await waitFor( () => {
		expect( screen.getByDisplayValue( 'blog' ) ).toBeInTheDocument();
		expect( screen.getByDisplayValue( 'https://newsite.com/path' ) ).toBeInTheDocument();
	} );

	expect( screen.getByRole( 'button', { name: 'Update' } ) ).toBeInTheDocument();
} );

test.skip( 'renders edit form with pre-filled root domain forwarding data', async () => {
	const initialData = {
		domain_redirect_id: 123,
		target_host: 'newsite.com',
		is_secure: true,
		is_permanent: false,
		forward_paths: false,
	};

	renderEditForm( { initialData } );

	await waitFor( () => {
		expect( screen.getByDisplayValue( 'https://newsite.com' ) ).toBeInTheDocument();
	} );

	// For root domain forwarding, source type should be 'root'
	expect( screen.getByText( 'Source URL' ) ).toBeInTheDocument();
} );

test.skip( 'forces subdomain mode when forceSubdomain is true for existing subdomain forwarding', async () => {
	const initialData = {
		domain_redirect_id: 123,
		subdomain: 'blog',
		target_host: 'newsite.com',
		is_secure: true,
		is_permanent: false,
		forward_paths: false,
	};

	renderEditForm( {
		initialData,
		forceSubdomain: true,
	} );

	await waitFor( () => {
		expect( screen.getByDisplayValue( 'blog' ) ).toBeInTheDocument();
	} );

	// Should not show the source type selector when forceSubdomain is true
	expect( screen.queryByText( 'Source URL' ) ).not.toBeInTheDocument();
	expect( screen.getByText( 'Subdomain' ) ).toBeInTheDocument();
} );

test.skip( 'calls onSubmit with updated data when form is submitted', async () => {
	const user = userEvent.setup();
	const mockOnSubmit = jest.fn();

	const initialData = {
		domain_redirect_id: 123,
		subdomain: 'blog',
		target_host: 'oldsite.com',
		is_secure: true,
		is_permanent: false,
		forward_paths: false,
	};

	renderEditForm( {
		initialData,
		onSubmit: mockOnSubmit,
	} );

	await waitFor( () => {
		expect( screen.getByDisplayValue( 'blog' ) ).toBeInTheDocument();
	} );

	// Update the subdomain
	const subdomainInput = screen.getByDisplayValue( 'blog' );
	await user.clear( subdomainInput );
	await user.type( subdomainInput, 'news' );

	// Update the target URL
	const targetUrlInput = screen.getByDisplayValue( 'https://oldsite.com' );
	await user.clear( targetUrlInput );
	await user.type( targetUrlInput, 'https://newsite.com' );

	// Submit the form
	const submitButton = screen.getByRole( 'button', { name: 'Update' } );
	await user.click( submitButton );

	// Verify onSubmit was called with the updated data
	expect( mockOnSubmit ).toHaveBeenCalledWith( {
		sourceType: '',
		subdomain: 'news',
		targetUrl: 'https://newsite.com',
		isPermanent: false,
		forwardPaths: false,
	} );
} );

test.skip( 'shows advanced settings panel expanded when initial data has non-default values', async () => {
	const initialData = {
		domain_redirect_id: 123,
		subdomain: 'blog',
		target_host: 'newsite.com',
		is_secure: true,
		is_permanent: true, // non-default value
		forward_paths: true, // non-default value
	};

	renderEditForm( { initialData } );

	await waitFor( () => {
		expect( screen.getByDisplayValue( 'blog' ) ).toBeInTheDocument();
	} );

	// Advanced settings panel should be expanded due to non-default values
	await waitFor( () => {
		expect( screen.getByText( 'Advanced settings' ) ).toBeInTheDocument();
		expect( screen.getByText( 'HTTP Redirect Type' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Path forwarding' ) ).toBeInTheDocument();
	} );
} );

test.skip( 'disables submit button when isSubmitting is true', async () => {
	const initialData = {
		domain_redirect_id: 123,
		subdomain: 'blog',
		target_host: 'newsite.com',
		is_secure: true,
		is_permanent: false,
		forward_paths: false,
	};

	renderEditForm( {
		initialData,
		isSubmitting: true,
	} );

	await waitFor( () => {
		expect( screen.getByDisplayValue( 'blog' ) ).toBeInTheDocument();
	} );

	const submitButton = screen.getByRole( 'button', { name: 'Update' } );
	expect( submitButton ).toBeDisabled();
} );

test.skip( 'handles HTTP vs HTTPS protocol correctly in pre-filled data', async () => {
	const httpData = {
		domain_redirect_id: 123,
		subdomain: 'blog',
		target_host: 'newsite.com',
		target_path: '/path',
		is_secure: false, // HTTP
		is_permanent: false,
		forward_paths: false,
	};

	renderEditForm( { initialData: httpData } );

	await waitFor( () => {
		expect( screen.getByDisplayValue( 'http://newsite.com/path' ) ).toBeInTheDocument();
	} );
} );

test.skip( 'handles advanced settings correctly when updating', async () => {
	const user = userEvent.setup();
	const mockOnSubmit = jest.fn();

	const initialData = {
		domain_redirect_id: 123,
		subdomain: 'blog',
		target_host: 'newsite.com',
		is_secure: true,
		is_permanent: false,
		forward_paths: false,
	};

	renderEditForm( {
		initialData,
		onSubmit: mockOnSubmit,
	} );

	await waitFor( () => {
		expect( screen.getByDisplayValue( 'blog' ) ).toBeInTheDocument();
	} );

	// Open advanced settings
	const advancedPanel = screen.getByText( 'Advanced settings' );
	await user.click( advancedPanel );

	await waitFor( () => {
		expect( screen.getByText( 'HTTP Redirect Type' ) ).toBeInTheDocument();
	} );

	// Change redirect type to permanent
	const permanentRadio = screen.getByRole( 'radio', { name: /permanent redirect/i } );
	await user.click( permanentRadio );

	// Submit the form
	const submitButton = screen.getByRole( 'button', { name: 'Update' } );
	await user.click( submitButton );

	// Verify onSubmit was called with the updated advanced settings
	expect( mockOnSubmit ).toHaveBeenCalledWith( {
		sourceType: '',
		subdomain: 'blog',
		targetUrl: 'https://newsite.com',
		isPermanent: true, // Updated value
		forwardPaths: false,
	} );
} );
