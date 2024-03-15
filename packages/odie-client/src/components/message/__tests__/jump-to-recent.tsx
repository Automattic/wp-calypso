/**
 * @jest-environment jsdom
 */

import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { OdieAssistantContext } from '../../../context';
import { mockOdieAssistantProviderProps } from '../../../context/test-utils/context-mock';
import { JumpToRecent } from '../jump-to-recent';

jest.mock( 'calypso/state/analytics/actions', () => ( {
	recordTracksEvent: jest.fn( () => ( {
		type: 'ANALYTICS_EVENT_RECORD',
	} ) ),
} ) );

describe( 'JumpToRecent', () => {
	const scrollToBottom = jest.fn();

	beforeAll( () => {
		jest.clearAllMocks();
	} );

	it( 'calls scrollToBottom and recordTracksEvent on button click', () => {
		const { getByText } = render(
			<OdieAssistantContext.Provider value={ mockOdieAssistantProviderProps }>
				<JumpToRecent
					scrollToBottom={ scrollToBottom }
					enableJumpToRecent={ true }
					bottomOffset={ 0 }
				/>
			</OdieAssistantContext.Provider>
		);

		fireEvent.click( getByText( 'Jump to recent' ) );

		expect( scrollToBottom ).toHaveBeenCalled();
		expect( mockOdieAssistantProviderProps.trackEvent ).toHaveBeenCalledWith(
			'chat_jump_to_recent_click'
		);
	} );

	it( 'renders correctly when enableJumpToRecent is true', () => {
		const { container } = render(
			<OdieAssistantContext.Provider value={ mockOdieAssistantProviderProps }>
				<JumpToRecent
					scrollToBottom={ scrollToBottom }
					enableJumpToRecent={ true }
					bottomOffset={ 0 }
				/>
			</OdieAssistantContext.Provider>
		);

		expect( container.firstChild ).toHaveClass( 'odie-gradient-to-white' );
		expect( container.firstChild ).toHaveClass( 'is-visible' );
	} );

	it( 'does not render visible class when enableJumpToRecent is false', () => {
		const { container } = render(
			<OdieAssistantContext.Provider value={ mockOdieAssistantProviderProps }>
				<JumpToRecent
					scrollToBottom={ scrollToBottom }
					enableJumpToRecent={ false }
					bottomOffset={ 0 }
				/>
			</OdieAssistantContext.Provider>
		);

		expect( container.firstChild ).toHaveClass( 'odie-gradient-to-white' );
		expect( container.firstChild ).not.toHaveClass( 'is-visible' );
	} );
} );
