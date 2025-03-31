import { createContext, ReactNode } from 'react';

export interface StepContainerV2InternalContextType {
	isSmallViewport: boolean;
	isLargeViewport: boolean;
	topBarHeight: number;
	setTopBarHeight: ( height: number ) => void;
	stickyBottomBarHeight: number;
	setStickyBottomBarHeight: ( height: number ) => void;
}

export type ContentProp< T = ReactNode > =
	| ( (
			context: Pick< StepContainerV2InternalContextType, 'isSmallViewport' | 'isLargeViewport' >
	  ) => T )
	| T;

export const StepContainerV2Context = createContext< StepContainerV2InternalContextType >( {
	isSmallViewport: false,
	isLargeViewport: false,
	topBarHeight: 0,
	setTopBarHeight: () => {},
	stickyBottomBarHeight: 0,
	setStickyBottomBarHeight: () => {},
} );
