import React from 'react';

type NoticeDensity = 'low' | 'medium' | 'high';

export type NoticeVariant = 'warning' | 'success' | 'error' | 'info';

export interface NoticeProps {
	/**
	 * Determines the color of the notice: `warning` (yellow),
	 * `success` (green), `error` (red), or `'info'`.
	 * By default `'info'` will be blue, but if there is a parent Theme component
	 * with an accent color prop, the notice will take on that color instead.
	 *
	 * @default 'info'
	 */
	variant?: NoticeVariant;

	/**
	 * The main label that identifies the notice.
	 */
	title: React.ReactNode;

	/**
	 * Optional supporting text that provides additional context or
	 * detail about the notice.
	 */
	description?: React.ReactNode;

	/**
	 * Renders a button that invokes the related notice.
	 */
	actions: React.ReactNode;

	/**
	 * Adjusts spacing and layout. Higher density reduces padding to
	 * create a more compact appearance.
	 *
	 * @default 'low'
	 */
	density?: NoticeDensity;

	/**
	 * Whether the notice should be dismissible or not
	 *
	 * @default true
	 */
	isDismissible?: boolean;

	/**
	 * Function called when dismissing the notice
	 *
	 * @default noop
	 */
	onRemove?: () => void;
}
