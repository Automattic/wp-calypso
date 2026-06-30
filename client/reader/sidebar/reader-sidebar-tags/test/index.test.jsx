/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { renderWithProvider as render } from 'calypso/test-helpers/testing-library';
import { ReaderSidebarTags } from '../index';

jest.mock( '@automattic/calypso-router', () => jest.fn() );

jest.mock( 'calypso/reader/stats', () => ( {
	recordAction: jest.fn(),
	recordGaEvent: jest.fn(),
} ) );

jest.mock( '../list', () => ( {
	__esModule: true,
	default: () => null,
} ) );

jest.mock( '../add-tags-form', () => ( {
	AddTagForm: () => null,
} ) );

const baseProps = {
	tags: [],
	path: '/read',
	isOpen: false,
	onFollowTag: jest.fn(),
	recordReaderTracksEvent: jest.fn(),
	translate: ( text ) => text,
};

describe( 'ReaderSidebarTags', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'navigates to the tags page when the Tags title is clicked', async () => {
		const user = userEvent.setup();
		const onClick = jest.fn();

		render( <ReaderSidebarTags { ...baseProps } onClick={ onClick } /> );
		await user.click( screen.getByText( 'Tags' ) );

		expect( page ).toHaveBeenCalledWith( '/tags' );
		expect( onClick ).not.toHaveBeenCalled();
	} );

	it( 'records analytics when the Tags title is clicked', async () => {
		const user = userEvent.setup();
		const recordReaderTracksEvent = jest.fn();

		render(
			<ReaderSidebarTags
				{ ...baseProps }
				onClick={ jest.fn() }
				recordReaderTracksEvent={ recordReaderTracksEvent }
			/>
		);
		await user.click( screen.getByText( 'Tags' ) );

		expect( recordAction ).toHaveBeenCalledWith( 'clicked_reader_sidebar_tags' );
		expect( recordGaEvent ).toHaveBeenCalledWith( 'Clicked Reader Sidebar Tags' );
		expect( recordReaderTracksEvent ).toHaveBeenCalledWith( 'calypso_reader_sidebar_tags_clicked' );
	} );

	it( 'opens or closes the menu only via the chevron icon, without navigating', async () => {
		const user = userEvent.setup();
		const onClick = jest.fn();

		render( <ReaderSidebarTags { ...baseProps } onClick={ onClick } /> );
		await user.click( screen.getByRole( 'button', { name: 'Expand menu' } ) );

		expect( onClick ).toHaveBeenCalledTimes( 1 );
		expect( page ).not.toHaveBeenCalled();
	} );
} );
