/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import UserProfilePrivateTabNotice from '../index';

const mockUseQuery = jest.fn();
jest.mock( '@tanstack/react-query', () => ( {
	useQuery: ( options: unknown ) => mockUseQuery( options ),
} ) );

jest.mock( '@automattic/api-queries', () => ( {
	userPreferenceQuery: ( key: string ) => ( { queryKey: [ 'user-preference', key ] } ),
} ) );

const mockRecordReaderTracksEvent = jest.fn();
jest.mock( 'calypso/state/reader/analytics/useRecordReaderTracksEvent', () => ( {
	useRecordReaderTracksEvent: () => mockRecordReaderTracksEvent,
} ) );

const defaultProps = {
	title: 'Your achievements are private',
	tab: 'achievements' as const,
	userPreferencesKey: 'achievements-visibility' as const,
};

describe( 'UserProfilePrivateTabNotice', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'renders nothing when visibility is public', () => {
		mockUseQuery.mockReturnValue( { data: 'public' } );

		const { container } = render( <UserProfilePrivateTabNotice { ...defaultProps } /> );

		expect( container.innerHTML ).toBe( '' );
	} );

	test( 'renders the passed-in title and private notice copy when visibility is private', () => {
		mockUseQuery.mockReturnValue( { data: 'private' } );

		const { container } = render( <UserProfilePrivateTabNotice { ...defaultProps } /> );

		expect( container ).toHaveTextContent( 'Your achievements are private' );
		expect( container ).toHaveTextContent(
			'Only you can see them. Make them public from the Settings tab.'
		);
	} );

	test( 'treats missing visibility data as private', () => {
		mockUseQuery.mockReturnValue( { data: undefined } );

		const { container } = render( <UserProfilePrivateTabNotice { ...defaultProps } /> );

		expect( container ).toHaveTextContent( 'Your achievements are private' );
	} );

	test( 'fires the impression event with the tab when rendered as private', () => {
		mockUseQuery.mockReturnValue( { data: 'private' } );

		render( <UserProfilePrivateTabNotice { ...defaultProps } /> );

		expect( mockRecordReaderTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_profile_private_tab_notice_displayed',
			{ tab: 'achievements' }
		);
	} );

	test( 'does not fire the impression event when visibility is public', () => {
		mockUseQuery.mockReturnValue( { data: 'public' } );

		render( <UserProfilePrivateTabNotice { ...defaultProps } /> );

		expect( mockRecordReaderTracksEvent ).not.toHaveBeenCalled();
	} );
} );
