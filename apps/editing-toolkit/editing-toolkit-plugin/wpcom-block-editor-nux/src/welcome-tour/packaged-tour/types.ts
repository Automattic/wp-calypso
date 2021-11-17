import type { Modifier } from 'react-popper';

export type Step = {
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
};

export type TourStepRendererProps = {
	steps: Steps;
	currentStepIndex: number;
	onDismiss: ( source: string ) => () => void;
	onNext: () => void;
	onPrevious: () => void;
	onMinimize: () => void;
	setInitialFocusedElement: React.Dispatch< React.SetStateAction< HTMLElement | null > >;
	onGoToStep: ( stepIndex: number ) => void;
};

export type MinimizedTourRendererProps = {
	steps: Steps;
	currentStepIndex: number;
	onMaximize: () => void;
	onDismiss: ( source: string ) => () => void;
};

export type Steps = Step[];
export type TourStepRenderer = React.FunctionComponent< TourStepRendererProps >;
export type MinimizedTourRenderer = React.FunctionComponent< MinimizedTourRendererProps >;
export type Callback = ( currentStepIndex: number ) => void;
export type CloseHandler = ( steps: Steps, currentStepIndex: number, source: string ) => void;
export type PopperModifier = Partial< Modifier< unknown, Record< string, unknown > > >;

export interface Config {
	steps: Steps;
	renderers: {
		tourStep: TourStepRenderer;
		tourMinimized: MinimizedTourRenderer;
	};
	closeHandler: CloseHandler;
	options?: {
		className?: string;
		callbacks?: {
			onMinimize?: Callback;
			onMaximize?: Callback;
			onGoToStep?: Callback;
			onNextStep?: Callback;
			onPreviousStep?: Callback;
		};
		effects?: {
			__experimental__spotlight?: boolean;
			arrowIndicator?: boolean; // defaults to true
			overlay?: boolean;
		};
		popperModifiers?: PopperModifier[];
	};
}
