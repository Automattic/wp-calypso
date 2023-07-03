import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

export type Nudge = {
	nudge: string;
	initialMessage: string;
	context?: Record< string, unknown >;
};
interface OdysseusAssistantContextInterface {
	currentView: string;
	setCurrentView: ( currentView: string ) => void;
	sectionName: string;
	sendNudge: ( nudge: Nudge ) => void;
	lastNudge: Nudge | null;
}

const defaultCurrentViewContextInterface = {
	currentView: '',
	setCurrentView: noop,
	sectionName: '',
	sendNudge: noop,
	lastNudge: null,
};

// Create a new context
const OdysseusAssistantContext = createContext< OdysseusAssistantContextInterface >(
	defaultCurrentViewContextInterface
);

// Custom hook to access the OdysseusAssistantContext
const useOdysseusAssistantContext = () => useContext( OdysseusAssistantContext );

// Create a provider component for the context
const OdysseusAssistantProvider = ( {
	sectionName,
	children,
}: {
	sectionName: string;
	children: ReactNode;
} ) => {
	const [ currentView, setCurrentView ] = useState( '' );
	const [ lastNudge, setLastNudge ] = useState< Nudge | null >( null );

	return (
		<OdysseusAssistantContext.Provider
			value={ { currentView, setCurrentView, sectionName, sendNudge: setLastNudge, lastNudge } }
		>
			{ children }
		</OdysseusAssistantContext.Provider>
	);
};

export { OdysseusAssistantContext, OdysseusAssistantProvider, useOdysseusAssistantContext };
