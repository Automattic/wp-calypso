/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider as render } from 'calypso/test-helpers/testing-library';
import { ReaderSidebarLists } from '../index';

jest.mock( '@automattic/calypso-router', () => jest.fn() );

jest.mock( '../list', () => ( {
	__esModule: true,
	default: () => null,
} ) );

const baseProps = {
	lists: [],
	path: '/read',
	isOpen: false,
	recordReaderTracksEvent: jest.fn(),
	translate: ( text ) => text,
};

describe( 'ReaderSidebarLists', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'navigates to the lists page when the Lists title is clicked', async () => {
		const user = userEvent.setup();
		const onClick = jest.fn();

		render( <ReaderSidebarLists { ...baseProps } onClick={ onClick } /> );
		await user.click( screen.getByText( 'Lists' ) );

		expect( page ).toHaveBeenCalledWith( '/reader/lists' );
		expect( onClick ).not.toHaveBeenCalled();
	} );

	it( 'records analytics when the Lists title is clicked', async () => {
		const user = userEvent.setup();
		const recordReaderTracksEvent = jest.fn();

		render(
			<ReaderSidebarLists
				{ ...baseProps }
				onClick={ jest.fn() }
				recordReaderTracksEvent={ recordReaderTracksEvent }
			/>
		);
		await user.click( screen.getByText( 'Lists' ) );

		expect( recordReaderTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_sidebar_lists_dropdown_title_clicked'
		);
	} );

	it( 'opens or closes the menu only via the chevron icon, without navigating', async () => {
		const user = userEvent.setup();
		const onClick = jest.fn();

		render( <ReaderSidebarLists { ...baseProps } onClick={ onClick } /> );
		await user.click( screen.getByRole( 'button', { name: 'Expand menu' } ) );

		expect( onClick ).toHaveBeenCalledTimes( 1 );
		expect( page ).not.toHaveBeenCalled();
	} );
} );
