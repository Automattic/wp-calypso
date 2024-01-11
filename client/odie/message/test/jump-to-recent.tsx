/**
 * @jest-environment jsdom
 */
import { fireEvent } from '@testing-library/react';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { renderWithOdieContext } from '../../test-utils/mock-odie';
import { JumpToRecent } from '../jump-to-recent';

jest.mock( 'calypso/state/analytics/actions', () => ( {
	recordTracksEvent: jest.fn( () => ( {
		type: 'ANALYTICS_EVENT_RECORD',
	} ) ),
} ) );

describe( 'JumpToRecent', () => {
	const scrollToBottom = jest.fn();

	it( 'calls scrollToBottom and recordTracksEvent on button click', () => {
		const { getByText } = renderWithOdieContext(
			<JumpToRecent
				scrollToBottom={ scrollToBottom }
				enableJumpToRecent={ true }
				bottomOffset={ 0 }
			/>,
			{},
			{ botSetting: 'Wapuu' }
		);

		fireEvent.click( getByText( 'Jump to recent' ) );

		expect( scrollToBottom ).toHaveBeenCalled();
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_odie_chat_jump_to_recent_click', {
			bot_name_slug: 'wpcom-support-chat',
			bot_setting: 'Wapuu',
		} );
	} );

	it( 'renders correctly when enableJumpToRecent is true', () => {
		const { container } = renderWithOdieContext(
			<JumpToRecent
				scrollToBottom={ scrollToBottom }
				enableJumpToRecent={ true }
				bottomOffset={ 0 }
			/>
		);

		expect( container.firstChild ).toHaveClass( 'odie-gradient-to-white' );
		expect( container.firstChild ).toHaveClass( 'is-visible' );
	} );

	it( 'does not render visible class when enableJumpToRecent is false', () => {
		const { container } = renderWithOdieContext(
			<JumpToRecent
				scrollToBottom={ scrollToBottom }
				enableJumpToRecent={ false }
				bottomOffset={ 0 }
			/>
		);

		expect( container.firstChild ).toHaveClass( 'odie-gradient-to-white' );
		expect( container.firstChild ).not.toHaveClass( 'is-visible' );
	} );
} );
