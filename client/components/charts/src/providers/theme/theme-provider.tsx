import { createContext, useContext, FC, ReactNode } from 'react';
import { defaultTheme } from './themes';
import type { ChartTheme } from '../../components/shared/types';

/**
 * Context for sharing theme configuration across components
 */
const ThemeContext = createContext< ChartTheme >( defaultTheme );

/**
 * Hook to access chart theme
 * @return {object} A built theme configuration compatible with visx charts
 */
const useChartTheme = () => {
	const theme = useContext( ThemeContext );
	return theme;
};

/**
 * Props for the ThemeProvider component
 */
type ThemeProviderProps = {
	/** Optional partial theme override */
	theme?: Partial< ChartTheme >;
	/** Child components that will have access to the theme */
	children: ReactNode;
};

// Provider component for chart theming
// Allows theme customization through props while maintaining default values
const ThemeProvider: FC< ThemeProviderProps > = ( { theme = {}, children } ) => {
	const mergedTheme = { ...defaultTheme, ...theme };
	return <ThemeContext.Provider value={ mergedTheme }>{ children }</ThemeContext.Provider>;
};

export { ThemeProvider, useChartTheme };
