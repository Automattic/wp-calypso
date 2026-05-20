/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AchievementsPrivacyNotice from '../index';

const mockUseQuery = jest.fn();
jest.mock( '@tanstack/react-query', () => ( {
	useQuery: ( options: unknown ) => mockUseQuery( options ),
} ) );

jest.mock( '@automattic/api-queries', () => ( {
	userPreferenceQuery: ( key: string ) => ( { queryKey: [ 'user-preference', key ] } ),
} ) );

const mockSetVisibility = jest.fn();
jest.mock( 'calypso/reader/components/achievements/use-set-achievements-visibility', () => ( {
	__esModule: true,
	default: () => ( { setVisibility: mockSetVisibility, isPending: false } ),
} ) );

const mockRecordReaderTracksEvent = jest.fn();
jest.mock( 'calypso/state/reader/analytics/useRecordReaderTracksEvent', () => ( {
	useRecordReaderTracksEvent: () => mockRecordReaderTracksEvent,
} ) );

jest.mock( 'calypso/reader/stats', () => ( {
	recordAction: jest.fn(),
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

	test( 'renders notice with Make public action when visibility is private', () => {
		mockUseQuery.mockReturnValue( { data: 'private' } );

		const { container } = render( <AchievementsPrivacyNotice /> );

		expect( container ).toHaveTextContent(
			'Your achievements are private — only you can see them.'
		);
		expect( screen.getByRole( 'button', { name: 'Make public' } ) ).toBeVisible();
	} );

	test( 'fires impression event when rendered as private', () => {
		mockUseQuery.mockReturnValue( { data: 'private' } );

		render( <AchievementsPrivacyNotice /> );

		expect( mockRecordReaderTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_achievements_privacy_notice_displayed'
		);
	} );

	test( 'clicking Make public calls setVisibility with "public" and fires tracks event', async () => {
		const user = userEvent.setup();
		mockUseQuery.mockReturnValue( { data: 'private' } );

		render( <AchievementsPrivacyNotice /> );

		await user.click( screen.getByRole( 'button', { name: 'Make public' } ) );

		expect( mockSetVisibility ).toHaveBeenCalledWith( 'public' );
		expect( mockRecordReaderTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_achievements_privacy_notice_make_public_clicked'
		);
	} );
} );
