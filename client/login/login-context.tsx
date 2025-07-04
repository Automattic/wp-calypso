import { createContext, useContext, useState } from '@wordpress/element';
import { type TranslateResult } from 'i18n-calypso';

export interface LoginContextType {
	headingText?: TranslateResult | null;
	headingSubText?: TranslateResult | null;
	setHeadingText: ( headingText: TranslateResult | null ) => void;
	setHeadingSubText: ( headingSubText: TranslateResult | null ) => void;
}

export const LoginContext = createContext< LoginContextType >( {} as LoginContextType );

const LoginContextProvider = ( { children }: { children: React.ReactNode } ) => {
	const [ headingText, setHeadingText ] = useState< TranslateResult | undefined | null >(
		undefined
	);
	const [ headingSubText, setHeadingSubText ] = useState< TranslateResult | undefined | null >(
		undefined
	);

	return (
		<LoginContext.Provider
			value={ {
				headingText,
				headingSubText,
				setHeadingText,
				setHeadingSubText,
			} }
		>
			{ children }
		</LoginContext.Provider>
	);
};

export const useLoginContext = (): LoginContextType => useContext( LoginContext );

export default LoginContextProvider;
