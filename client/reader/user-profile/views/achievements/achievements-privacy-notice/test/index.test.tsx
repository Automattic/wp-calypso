/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import AchievementsPrivacyNotice from '../index';

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

describe( 'AchievementsPrivacyNotice', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'renders nothing when visibility is public', () => {
		mockUseQuery.mockReturnValue( { data: 'public' } );

		const { container } = render( <AchievementsPrivacyNotice /> );

		expect( container.innerHTML ).toBe( '' );
	} );

	test( 'renders the privacy notice copy when visibility is private', () => {
		mockUseQuery.mockReturnValue( { data: 'private' } );

		const { container } = render( <AchievementsPrivacyNotice /> );

		expect( container ).toHaveTextContent( 'Your achievements are private' );
		expect( container ).toHaveTextContent( 'Open the achievement settings below' );
	} );

	test( 'fires impression event when rendered as private', () => {
		mockUseQuery.mockReturnValue( { data: 'private' } );

		render( <AchievementsPrivacyNotice /> );

		expect( mockRecordReaderTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_achievements_privacy_notice_displayed'
		);
	} );
} );
