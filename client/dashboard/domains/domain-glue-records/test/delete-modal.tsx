/**
 * @jest-environment jsdom
 */
import { DomainGlueRecord } from '@automattic/api-core';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import DomainGlueRecordDeleteModal from '../delete-modal';

const domainName = 'example.com';
const glueRecord: DomainGlueRecord = {
	nameserver: 'ns1',
	ip_addresses: [ '1.2.3.4' ],
};

interface RenderDeleteModalProps {
	onClose?: () => void;
}

function renderDeleteModal( props: RenderDeleteModalProps = {} ) {
	const defaultProps = {
		domainName,
		glueRecord,
		onClose: jest.fn(),
		...props,
	};

	return render( <DomainGlueRecordDeleteModal { ...defaultProps } /> );
}

const mockDeleteDomainGlueRecordApiRequest = ( {
	responseCode = 500,
}: {
	responseCode?: number;
} = {} ) => {
	return nock( 'https://public-api.wordpress.com' )
		.delete( `/wpcom/v2/domains/glue-records/${ domainName }`, {
			name_server: glueRecord.nameserver,
		} )
		.once()
		.reply( responseCode );
};

afterEach( () => nock.cleanAll() );

test( 'renders delete modal with correct title and buttons', async () => {
	renderDeleteModal();

	expect(
		screen.getByText( 'Are you sure you want to delete this glue record?' )
	).toBeInTheDocument();
	expect( screen.getByRole( 'button', { name: 'Cancel' } ) ).toBeInTheDocument();
	expect( screen.getByRole( 'button', { name: 'Delete' } ) ).toBeInTheDocument();
} );

test( 'calls onClose when Cancel button is clicked', async () => {
	const user = userEvent.setup();
	const mockOnClose = jest.fn();

	renderDeleteModal( { onClose: mockOnClose } );

	await user.click( screen.getByRole( 'button', { name: 'Cancel' } ) );

	expect( mockOnClose ).toHaveBeenCalled();
} );

test( 'calls delete mutation and onClose when Delete button is clicked and the request is successful', async () => {
	const user = userEvent.setup();
	const mockOnClose = jest.fn();

	renderDeleteModal( { onClose: mockOnClose } );

	mockDeleteDomainGlueRecordApiRequest();

	await user.click( screen.getByRole( 'button', { name: 'Delete' } ) );

	await waitFor( () => expect( mockOnClose ).toHaveBeenCalled() );
} );

test( 'calls delete mutation and onClose when Delete button is clicked and the request fails', async () => {
	const user = userEvent.setup();
	const mockOnClose = jest.fn();

	renderDeleteModal( { onClose: mockOnClose } );

	mockDeleteDomainGlueRecordApiRequest( { responseCode: 500 } );

	await user.click( screen.getByRole( 'button', { name: 'Delete' } ) );

	await waitFor( () => expect( mockOnClose ).toHaveBeenCalled() );
} );
