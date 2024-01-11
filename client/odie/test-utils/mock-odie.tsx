/**
 * @jest-environment jsdom
 */
import { RenderOptions, render } from '@testing-library/react';
import { Provider as ReduxProvider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { OdieAssistantContext, OdieAssistantContextInterface, noop } from '../context';

type TestState = object;

const initialState: TestState = {};

const dummyReducer = ( state: TestState = initialState ): TestState => {
	return state;
};

const createTestStore = () => {
	return createStore( dummyReducer, {}, applyMiddleware( thunk ) );
};

export const renderWithOdieContext = (
	ui: React.ReactElement,
	options: RenderOptions = {},
	context: Partial< OdieAssistantContextInterface > = {}
) => {
	const store = createTestStore();

	const mockContextValue: OdieAssistantContextInterface = {
		botNameSlug: 'wpcom-support-chat',
		addMessage: noop,
		chat: {
			chat_id: undefined,
			messages: [],
		},
		clearChat: noop,
		initialUserMessage: undefined,
		isLoadingChat: false,
		isLoading: false,
		isNudging: false,
		isVisible: false,
		lastNudge: null,
		sendNudge: noop,
		setChat: noop,
		setIsLoadingChat: noop,
		setMessageLikedStatus: noop,
		setContext: noop,
		setIsNudging: noop,
		setIsVisible: noop,
		setIsLoading: noop,
		trackEvent: noop,
		...context,
	};

	return render(
		<ReduxProvider store={ store }>
			<OdieAssistantContext.Provider value={ mockContextValue }>
				{ ui }
			</OdieAssistantContext.Provider>
		</ReduxProvider>,
		options
	);
};
