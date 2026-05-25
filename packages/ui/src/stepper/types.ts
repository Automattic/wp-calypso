// packages/ui/src/stepper/types.ts
import type { CSSProperties, ReactNode, Ref } from 'react';

// ---------------------------------------------------------------------------
// Utility types
// ---------------------------------------------------------------------------

/**
 * Requires exactly one of the listed keys to be present.
 * Used to enforce `aria-label` XOR `aria-labelledby`.
 */
export type RequireOneOf< T, Keys extends keyof T > = Omit< T, Keys > &
	{
		[ K in Keys ]-?: Required< Pick< T, K > > & Partial< Record< Exclude< Keys, K >, never > >;
	}[ Keys ];

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

export type StepperProps = RequireOneOf<
	StepperBaseProps & {
		'aria-label'?: string;
		'aria-labelledby'?: string;
	},
	'aria-label' | 'aria-labelledby'
>;

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
