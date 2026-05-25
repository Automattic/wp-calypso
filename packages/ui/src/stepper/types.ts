import type { ReactNode, Ref } from 'react';

export type StepStatus = 'completed' | 'error';
export type StepOrientation = 'vertical' | 'horizontal';

/** Internal metadata about a registered step. */
export type StepMeta = {
	value: string;
	index: number; // 0-based registration order
	status?: StepStatus;
	disabled: boolean;
	optional: boolean;
};

/** Imperative handle exposed via ref. */
export type StepperRef = {
	focusStep: ( value: string ) => void;
};

// ─── Tier 1 props ────────────────────────────────────────────────────────────

type AriaLabelProps =
	| { 'aria-label': string; 'aria-labelledby'?: never }
	| { 'aria-label'?: never; 'aria-labelledby': string };

export type StepperProps = AriaLabelProps & {
	value?: string;
	defaultValue?: string;
	onValueChange?: ( value: string ) => void;
	linear?: boolean;
	/** Vertical only. Heading level wrapping each trigger. @default 3 */
	headingLevel?: 2 | 3 | 4 | 5 | 6;
	/** Horizontal only. Whether focus immediately activates a tab. @default 'manual' */
	activationMode?: 'auto' | 'manual';
	formatStepLabel?: ( step: number, total: number, status?: StepStatus ) => string;
	children: ReactNode;
	className?: string;
	ref?: Ref< StepperRef >;
};

export type StepProps = {
	value: string;
	title: string;
	description?: string;
	status?: StepStatus;
	optional?: boolean;
	disabled?: boolean;
	indicator?: ReactNode;
	/** Keep panel mounted when inactive (horizontal only). */
	forceMount?: boolean;
	children: ReactNode;
	className?: string;
};

// ─── Tier 2 props ────────────────────────────────────────────────────────────

export type StepperRootProps = AriaLabelProps & {
	orientation: StepOrientation;
	value?: string;
	defaultValue?: string;
	onValueChange?: ( value: string ) => void;
	linear?: boolean;
	headingLevel?: 2 | 3 | 4 | 5 | 6;
	activationMode?: 'auto' | 'manual';
	formatStepLabel?: ( step: number, total: number, status?: StepStatus ) => string;
	children: ReactNode;
	className?: string;
	ref?: Ref< StepperRef >;
};

export type StepperListProps = {
	children: ReactNode;
	className?: string;
};

export type StepperStepProps = {
	value: string;
	status?: StepStatus;
	optional?: boolean;
	disabled?: boolean;
	children: ReactNode;
	className?: string;
};

export type StepperTriggerProps = React.ComponentPropsWithoutRef< 'button' > & {
	children: ReactNode;
	className?: string;
};

export type StepperPanelProps = React.ComponentPropsWithoutRef< 'div' > & {
	/** Required in horizontal mode to associate panel with a step. */
	value?: string;
	forceMount?: boolean;
	children: ReactNode;
	className?: string;
};

export type StepperIndicatorProps = {
	children?: ReactNode;
	className?: string;
};

export type StepperTitleProps = React.ComponentPropsWithoutRef< 'span' > & {
	children: ReactNode;
	className?: string;
};

export type StepperDescriptionProps = React.ComponentPropsWithoutRef< 'span' > & {
	children: ReactNode;
	className?: string;
};

// ─── Context values ──────────────────────────────────────────────────────────

export type StepperContextValue = {
	rootId: string;
	value: string;
	onValueChange: ( value: string ) => void;
	orientation: StepOrientation;
	linear: boolean;
	headingLevel: 2 | 3 | 4 | 5 | 6;
	activationMode: 'auto' | 'manual';
	formatStepLabel: ( step: number, total: number, status?: StepStatus ) => string;
	steps: StepMeta[];
	registerStep: ( meta: Omit< StepMeta, 'index' > ) => () => void;
};

export type StepContextValue = {
	value: string;
	index: number; // 0-based
	totalSteps: number;
	isCurrent: boolean;
	status?: StepStatus;
	/** True if explicitly disabled OR blocked by linear flow. */
	isDisabled: boolean;
	optional: boolean;
};

// ─── ID helpers ──────────────────────────────────────────────────────────────

/** Returns a stable, unique trigger button id for a given step. */
export function stepTriggerId( rootId: string, value: string ): string {
	return `stepper-${ rootId }-trigger-${ value }`;
}

/** Returns a stable, unique panel id for a given step. */
export function stepPanelId( rootId: string, value: string ): string {
	return `stepper-${ rootId }-panel-${ value }`;
}
