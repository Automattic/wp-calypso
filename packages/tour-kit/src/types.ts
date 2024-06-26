import * as PopperJS from '@popperjs/core';
import React from 'react';
import { SpotlightInteractivityConfiguration } from './components/tour-kit-spotlight-interactivity';
import { LiveResizeConfiguration } from './utils/live-resize-modifier';
import type { Modifier } from 'react-popper';

export interface Step {
	slug?: string;
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
	onStepView?: Callback;
}

export interface Options {
	classNames?: string | string[];
	callbacks?: Callbacks;
	/** An object to enable/disable/combine various tour effects, such as spotlight, overlay, and autoscroll */
	effects?: {
		/**
		 * Adds a semi-transparent overlay and highlights the reference element
		 * 	when provided with a transparent box over it. The existence of this configuration
		 *  key implies enabling the spotlight effect.
		 */
		spotlight?: {
			/** An object that configures whether the user is allowed to interact with the referenced element during the tour */
			interactivity?: SpotlightInteractivityConfiguration;
			/** CSS properties that configures the styles applied to the spotlight overlay */
			styles?: React.CSSProperties;
		};
		/** Shows a little triangle that points to the referenced element. Defaults to true */
		arrowIndicator?: boolean;
		/**
		 * Includes the semi-transparent overlay for all the steps Also blocks interactions for everything except the tour dialogues,
		 *  including the referenced elements. Refer to spotlight interactivity configuration to affect this.
		 *
		 *  Defaults to false, but if spotlight is enabled it implies this is enabled as well.
		 */
		overlay?: boolean;
		/** Configures the autoscroll behaviour. Defaults to False. More information about the configuration at: https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView */
		autoScroll?: ScrollIntoViewOptions | boolean;
		/** Configures the behaviour for automatically resizing the tour kit elements (TourKitFrame and Spotlight). Defaults to disabled. */
		liveResize?: LiveResizeConfiguration;
	};
	popperModifiers?: PopperModifier[];
	portalParentElement?: HTMLElement | null;
}

export interface Config {
	steps: Step[];
	renderers: {
		tourStep: TourStepRenderer;
		tourMinimized: MinimizedTourRenderer;
	};
	closeHandler: CloseHandler;
	isMinimized?: boolean;
	options?: Options;
	placement?: PopperJS.Placement;
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
		imgLink?: {
			href: string;
			playable?: boolean;
			onClick?: () => void;
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
