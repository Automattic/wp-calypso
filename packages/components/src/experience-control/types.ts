import { BaseControl } from '@wordpress/components';
import React from 'react';

/**
 * Represents the possible values for user experience feedback.
 */
export type ExperienceValue = 'good' | 'neutral' | 'bad';

/**
 * Defines the structure for an experience feedback option.
 */
export type ExperienceOption = {
	/** The value representing the experience level */
	value: ExperienceValue;
	/** The icon component to display for this option */
	icon: React.ReactNode;
	/** The accessibility label for this option */
	ariaLabel: string;
};

/**
 * Props for individual experience control option components.
 * Extends the native input element props.
 */
export type ExperienceControlOptionProps = Pick<
	React.ComponentProps< 'input' >,
	'checked' | 'onChange' | 'value' | 'name'
> & {
	/** Optional CSS class name */
	className?: string;
	/** The icon component for the option */
	icon: React.ReactNode;
	/** The accessibility label for the option */
	ariaLabel: string;
};

/**
 * Base props for the experience control component.
 * Extends WordPress BaseControl props with some exclusions.
 */
export type ExperienceControlBaseProps = Omit<
	React.ComponentProps< typeof BaseControl >,
	'__nextHasNoMarginBottom' | 'as'
>;

/**
 * Props for the main ExperienceControl component.
 */
export type ExperienceControlProps = {
	/** The label for the control */
	label: string;
	/** Optional help text for the control */
	help?: string;
	/** The callback function when experience value changes */
	onChange: ( experience: ExperienceValue ) => void;
	/** The current selected experience value */
	value: ExperienceValue;
	/** Optional name attribute for the control */
	name?: string;
};
