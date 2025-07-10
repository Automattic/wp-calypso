import { createContext, useContext, useState, useCallback } from '@wordpress/element';
import { type TranslateResult } from 'i18n-calypso';

export interface LoginContextType {
	headingText?: TranslateResult | null;
	subHeadingText?: TranslateResult | null;
	setHeaders: ( {
		heading,
		subHeading,
	}: {
		heading?: TranslateResult | null;
		subHeading?: TranslateResult | null;
	} ) => void;
}

export const LoginContext = createContext< LoginContextType >( {} as LoginContextType );

const LoginContextProvider = ( { children }: { children: React.ReactNode } ) => {
	const [ headingText, setHeadingText ] = useState< TranslateResult | undefined | null >(
		undefined
	);
	const [ subHeadingText, setSubHeadingText ] = useState< TranslateResult | undefined | null >(
		undefined
	);
	const setHeaders = useCallback(
		( {
			heading,
			subHeading,
		}: {
			heading?: TranslateResult | null;
			subHeading?: TranslateResult | null;
		} ) => {
			setHeadingText( heading );
			setSubHeadingText( subHeading );
		},
		[]
	);

	return (
		<LoginContext.Provider
			value={ {
				headingText,
				subHeadingText,
				setHeaders,
			} }
		>
			{ children }
		</LoginContext.Provider>
	);
};

export const useLoginContext = (): LoginContextType => useContext( LoginContext );

export default LoginContextProvider;
