/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { PLANS_PRESALES_LAUNCHER_CONTEXT } from '../../../constants';
import { useOdieAssistantContext } from '../../../context';
import { useSendChatMessage } from '../../../hooks';
import { IntroSuggestions } from '../intro-suggestions';

type Suggestion = { id: string; label: string; prompt?: string };

interface SuggestionsProps {
	suggestions: Suggestion[];
	onSubmit: ( suggestion: Suggestion ) => void;
}

jest.mock(
	'@automattic/agenttic-ui',
	() => ( {
		Suggestions: ( { suggestions, onSubmit }: SuggestionsProps ) => (
			<button onClick={ () => onSubmit( suggestions[ 0 ] ) }>Send prompt</button>
		),
	} ),
	{ virtual: true }
);
jest.mock( '@automattic/i18n-utils', () => ( {
	useHasEnTranslation: () => () => true,
} ) );
jest.mock( '../../../context', () => ( { useOdieAssistantContext: jest.fn() } ) );
jest.mock( '../../../hooks', () => ( { useSendChatMessage: jest.fn() } ) );

const trackEvent = jest.fn();
const sendMessage = jest.fn().mockResolvedValue( undefined );

function setup(
	messages: { role: string; content: string }[] = [],
	status = 'loaded',
	provider = 'odie'
) {
	jest.mocked( useOdieAssistantContext ).mockReturnValue( {
		chat: { messages, status, provider },
		launcherContext: PLANS_PRESALES_LAUNCHER_CONTEXT,
		trackEvent,
	} as unknown as ReturnType< typeof useOdieAssistantContext > );
	jest.mocked( useSendChatMessage ).mockReturnValue( { sendMessage, abort: jest.fn() } );
	return render( <IntroSuggestions /> );
}

describe( 'presales suggestion conversation starts', () => {
	beforeEach( () => jest.clearAllMocks() );

	it( 'tracks the first prompt before sending it', () => {
		setup();
		fireEvent.click( screen.getByRole( 'button', { name: 'Send prompt' } ) );

		expect( trackEvent ).toHaveBeenCalledWith( 'chat_conversation_start', {
			message_length: 'Compare the plans for me'.length,
			provider: 'odie',
		} );
		expect( sendMessage ).toHaveBeenCalledTimes( 1 );
		const startCall = trackEvent.mock.calls.findIndex(
			( [ event ] ) => event === 'chat_conversation_start'
		);
		expect( trackEvent.mock.invocationCallOrder[ startCall ] ).toBeLessThan(
			sendMessage.mock.invocationCallOrder[ 0 ]
		);
	} );

	it( 'does not count a follow-up prompt as a start', () => {
		setup( [ { role: 'user', content: 'Earlier question' } ] );
		fireEvent.click( screen.getByRole( 'button', { name: 'Send prompt' } ) );

		expect( sendMessage ).toHaveBeenCalledTimes( 1 );
		expect( trackEvent ).not.toHaveBeenCalledWith( 'chat_conversation_start', expect.anything() );
	} );

	it( 'does not send or track a start while busy', () => {
		setup( [], 'loading' );
		fireEvent.click( screen.getByRole( 'button', { name: 'Send prompt' } ) );

		expect( sendMessage ).not.toHaveBeenCalled();
		expect( trackEvent ).not.toHaveBeenCalled();
	} );

	it( 'does not offer prompts in a Zendesk conversation', () => {
		setup( [], 'loaded', 'zendesk' );

		expect( screen.queryByRole( 'button', { name: 'Send prompt' } ) ).toBeNull();
		expect( trackEvent ).not.toHaveBeenCalled();
	} );
} );
