import { createContext, useContext } from '@wordpress/element';
import type { RenderedPattern } from '../types';

export interface PatternsRendererContextValue {
	renderedPatterns: { [ key: string ]: RenderedPattern };
	shouldShufflePosts: boolean;
}

const PatternsRendererContext = createContext< PatternsRendererContextValue >( {
	renderedPatterns: {},
	shouldShufflePosts: false,
} as PatternsRendererContextValue );

export const usePatternsRendererContext = (): PatternsRendererContextValue =>
	useContext( PatternsRendererContext );

export default PatternsRendererContext;
