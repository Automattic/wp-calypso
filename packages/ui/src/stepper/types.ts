// packages/ui/src/stepper/types.ts
import type { CSSProperties, ReactNode, Ref } from 'react';

// ---------------------------------------------------------------------------
// Utility types
// ---------------------------------------------------------------------------

/**
 * Requires exactly one of `aria-label` or `aria-labelledby` — not both.
 * Passing both is a type error; passing neither is also a type error.
 */
type WithAriaLabel = { 'aria-label': string; 'aria-labelledby'?: never };
type WithAriaLabelledBy = { 'aria-label'?: never; 'aria-labelledby': string };
type AriaLabelXOR = WithAriaLabel | WithAriaLabelledBy;

// ---------------------------------------------------------------------------
// Step status
// ---------------------------------------------------------------------------

export type StepStatus = 'completed' | 'error';

// ---------------------------------------------------------------------------
// Registration record (populated by useStepRegistration)
// ---------------------------------------------------------------------------

export type StepMeta = {
	value: string;
	status?: StepStatus;
	/** True when explicitly disabled OR derived from linear flow */
	disabled: boolean;
};

// ---------------------------------------------------------------------------
// Context shapes
// ---------------------------------------------------------------------------

export type StepperContextValue = {
	value: string;
	onValueChange: ( value: string ) => void;
	orientation: 'vertical' | 'horizontal';
	linear: boolean;
	/** Heading level for trigger wrappers in vertical mode. Default: 3 */
	headingLevel: 2 | 3 | 4 | 5 | 6;
	/** Horizontal: whether arrow focus immediately activates a tab. Default: 'manual' */
	activationMode: 'auto' | 'manual';
	steps: StepMeta[];
	totalSteps: number;
	registerStep: ( meta: StepMeta ) => () => void;
	updateStep: ( meta: StepMeta ) => void;
	registerTriggerRef: ( value: string, el: HTMLElement | null ) => void;
	formatStepLabel: ( step: number, total: number, status?: StepStatus ) => string;
};

export type StepContextValue = {
	value: string;
	/** 0-based index derived from registration order */
	index: number;
	totalSteps: number;
	isCurrent: boolean;
	status?: StepStatus;
	/** Explicit disabled OR derived from linear flow + not completed */
	isDisabled: boolean;
	optional: boolean;
};

// ---------------------------------------------------------------------------
// Imperative ref
// ---------------------------------------------------------------------------

export type StepperRef = {
	focusStep: ( value: string ) => void;
};

// ---------------------------------------------------------------------------
// Tier 1 prop types
// ---------------------------------------------------------------------------

type StepperBaseProps = {
	value?: string;
	defaultValue?: string;
	onValueChange?: ( value: string ) => void;
	/** When true, only current and completed steps have interactive triggers */
	linear?: boolean;
	/**
	 * Heading level for trigger wrappers. Vertical only.
	 * @default 3
	 */
	headingLevel?: 2 | 3 | 4 | 5 | 6;
	/**
	 * Whether arrow key focus immediately activates a tab. Horizontal only.
	 * @default 'manual'
	 */
	activationMode?: 'auto' | 'manual';
	formatStepLabel?: ( step: number, total: number, status?: StepStatus ) => string;
	children: ReactNode;
	className?: string;
	style?: CSSProperties;
	ref?: Ref< StepperRef >;
};

export type StepperProps = StepperBaseProps & AriaLabelXOR;

// ---------------------------------------------------------------------------
// Tier 2 root prop type (used directly by Stepper.Root)
// ---------------------------------------------------------------------------

export type StepperRootProps = Omit< StepperBaseProps, 'ref' > &
	AriaLabelXOR & {
		orientation: 'vertical' | 'horizontal';
	};

export type StepProps = {
	value: string;
	title: string;
	description?: string;
	status?: StepStatus;
	optional?: boolean;
	disabled?: boolean;
	/** Custom indicator content; built-in accessible label is always generated */
	indicator?: ReactNode;
	/** Horizontal only: keep panel mounted when inactive */
	forceMount?: boolean;
	/** Panel content */
	children: ReactNode;
	className?: string;
};
