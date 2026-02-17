import {
	createContext,
	useContext,
	useState,
	useCallback,
	useEffect,
	useRef,
} from '@wordpress/element';
import { type TranslateResult } from 'i18n-calypso';

export interface LoginContextType {
	headingText?: TranslateResult | null;
	subHeadingText?: TranslateResult | null;
	subHeadingTextSecondary?: TranslateResult | null;
	setHeaders: ( {
		heading,
		subHeading,
		subHeadingSecondary,
	}: {
		heading?: TranslateResult | null;
		subHeading?: TranslateResult | null;
		subHeadingSecondary?: TranslateResult | null;
	} ) => void;
}

export interface LoginContextProviderProps {
	children: React.ReactNode;
	initialHeading?: TranslateResult | null;
	initialSubHeading?: TranslateResult | null;
	initialSubHeadingSecondary?: TranslateResult | null;
}

export const LoginContext = createContext< LoginContextType >( {} as LoginContextType );

const LoginContextProvider = ( {
	children,
	initialHeading,
	initialSubHeading,
	initialSubHeadingSecondary,
}: LoginContextProviderProps ) => {
	const [ headingText, setHeadingText ] = useState< TranslateResult | undefined | null >(
		initialHeading ?? undefined
	);
	const [ subHeadingText, setSubHeadingText ] = useState< TranslateResult | undefined | null >(
		initialSubHeading ?? undefined
	);
	const [ subHeadingTextSecondary, setSubHeadingTextSecondary ] = useState<
		TranslateResult | undefined | null
	>( initialSubHeadingSecondary ?? undefined );

	// Track if headers have been explicitly set via setHeaders
	const headersExplicitlySet = useRef( false );

	// Sync state when initial values change (e.g., when locale changes)
	// But only if headers haven't been explicitly set via setHeaders
	useEffect( () => {
		if ( ! headersExplicitlySet.current ) {
			setHeadingText( initialHeading ?? undefined );
		}
	}, [ initialHeading ] );

	useEffect( () => {
		if ( ! headersExplicitlySet.current ) {
			setSubHeadingText( initialSubHeading ?? undefined );
		}
	}, [ initialSubHeading ] );

	useEffect( () => {
		if ( ! headersExplicitlySet.current ) {
			setSubHeadingTextSecondary( initialSubHeadingSecondary ?? undefined );
		}
	}, [ initialSubHeadingSecondary ] );

	const setHeaders = useCallback(
		( {
			heading,
			subHeading,
			subHeadingSecondary,
		}: {
			heading?: TranslateResult | null;
			subHeading?: TranslateResult | null;
			subHeadingSecondary?: TranslateResult | null;
		} ) => {
			headersExplicitlySet.current = true;
			setHeadingText( heading );
			setSubHeadingText( subHeading );
			setSubHeadingTextSecondary( subHeadingSecondary );
		},
		[]
	);

	return (
		<LoginContext.Provider
			value={ {
				headingText,
				subHeadingText,
				subHeadingTextSecondary,
				setHeaders,
			} }
		>
			{ children }
		</LoginContext.Provider>
	);
};

export const useLoginContext = (): LoginContextType => useContext( LoginContext );

export default LoginContextProvider;
