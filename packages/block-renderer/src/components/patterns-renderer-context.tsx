import { createContext, useContext } from '@wordpress/element';
import type { RenderedPattern } from '../types';

export interface PatternsRendererContextValue {
	[ key: string ]: RenderedPattern;
}

const PatternsRendererContext = createContext< PatternsRendererContextValue >(
	{} as PatternsRendererContextValue
);

export const usePatternsRendererContext = (): PatternsRendererContextValue =>
	useContext( PatternsRendererContext );

export default PatternsRendererContext;
