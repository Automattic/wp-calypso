export type Steps = unknown;

export type TourStep = unknown;
export type TourMinimized = unknown;

export type PopperModifier = unknown;

export type Callback = ( currentStepIndex: number ) => void;
export type CloseHandler = ( steps: Steps, currentStepIndex: number, source: string ) => void;

export interface Config {
	steps: Steps;
	renderers: {
		tourStep: TourStep;
		tourMinimized: TourMinimized;
	};
	closeHandler: CloseHandler;
	options?: {
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
		className?: string;
	};
}
