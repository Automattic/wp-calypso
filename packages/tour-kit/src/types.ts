import React from 'react';
import type { Modifier } from 'react-popper';

export interface Step {
	referenceElements?: {
		desktop?: string;
		mobile?: string;
	};
	meta: {
		[ key: string ]: unknown;
		// | React.FunctionComponent< Record< string, unknown > >
		// | HTMLElement
		// | string
		// | ...
	};
	options?: {
		classNames?: {
			/**
			 * `desktop` classes are applied when min-width is larger or equal to 480px.
			 */
			desktop?: string | string[];
			/**
			 * `mobile` classes are applied when max-width is smaller than 480px.
			 */
			mobile?: string | string[];
		};
	};
}

export interface TourStepRendererProps {
	steps: Step[];
	currentStepIndex: number;
	onDismiss: ( source: string ) => () => void;
	onNextStep: () => void;
	onPreviousStep: () => void;
	onMinimize: () => void;
	setInitialFocusedElement: React.Dispatch< React.SetStateAction< HTMLElement | null > >;
	onGoToStep: ( stepIndex: number ) => void;
}

export interface MinimizedTourRendererProps {
	steps: Step[];
	currentStepIndex: number;
	onMaximize: () => void;
	onDismiss: ( source: string ) => () => void;
}

export type TourStepRenderer = React.FunctionComponent< TourStepRendererProps >;
export type MinimizedTourRenderer = React.FunctionComponent< MinimizedTourRendererProps >;
export type Callback = ( currentStepIndex: number ) => void;
export type CloseHandler = ( steps: Step[], currentStepIndex: number, source: string ) => void;
export type PopperModifier = Partial< Modifier< unknown, Record< string, unknown > > >;

export interface Callbacks {
	onMinimize?: Callback;
	onMaximize?: Callback;
	onGoToStep?: Callback;
	onNextStep?: Callback;
	onPreviousStep?: Callback;
	onStepViewOnce?: Callback;
}

export interface Options {
	classNames?: string | string[];
	callbacks?: Callbacks;
	effects?: {
		spotlight?: { styles?: React.CSSProperties };
		arrowIndicator?: boolean; // defaults to true
		overlay?: boolean;
	};
	popperModifiers?: PopperModifier[];
}

export interface Config {
	steps: Step[];
	renderers: {
		tourStep: TourStepRenderer;
		tourMinimized: MinimizedTourRenderer;
	};
	closeHandler: CloseHandler;
	options?: Options;
}

export type Tour = React.FunctionComponent< { config: Config } >;

/************************
 * WPCOM variant types: *
 ************************/

export type OnTourRateCallback = ( currentStepIndex: number, liked: boolean ) => void;

export interface WpcomStep extends Step {
	meta: {
		heading: string | null;
		descriptions: {
			desktop: string | React.ReactElement | null;
			mobile: string | React.ReactElement | null;
		};
		imgSrc?: {
			desktop?: {
				src: string;
				type: string;
			};
			mobile?: {
				src: string;
				type: string;
			};
		};
	};
}

export interface WpcomTourStepRendererProps extends TourStepRendererProps {
	steps: WpcomStep[];
}

export interface WpcomOptions extends Options {
	tourRating?: {
		enabled: boolean;
		useTourRating?: () => 'thumbs-up' | 'thumbs-down' | undefined;
		onTourRate?: ( rating: 'thumbs-up' | 'thumbs-down' ) => void;
	};
}

export interface WpcomConfig extends Omit< Config, 'renderers' > {
	steps: WpcomStep[];
	options?: WpcomOptions;
}

export type WpcomTour = React.FunctionComponent< { config: WpcomConfig } >;
