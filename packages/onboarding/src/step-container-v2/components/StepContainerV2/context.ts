import { createContext, ReactNode } from 'react';

export interface StepContainerV2InternalContextType {
	isSmallViewport: boolean;
	isLargeViewport: boolean;
}

export type ContentProp< T = ReactNode > =
	| ( ( context: StepContainerV2InternalContextType ) => T )
	| T;

export const StepContainerV2Context = createContext< StepContainerV2InternalContextType >( {
	isSmallViewport: false,
	isLargeViewport: false,
} );
