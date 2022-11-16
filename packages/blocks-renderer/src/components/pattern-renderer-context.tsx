import { createContext, useContext } from '@wordpress/element';
import type { RenderedPattern } from '../types';

export interface PatternRendererContextValue {
	[ key: string ]: RenderedPattern;
}

const PatternRendererContext = createContext< PatternRendererContextValue >(
	{} as PatternRendererContextValue
);

export const usePatternRendererContext = (): PatternRendererContextValue =>
	useContext( PatternRendererContext );

export default PatternRendererContext;
