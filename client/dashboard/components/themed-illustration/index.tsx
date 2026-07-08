import clsx from 'clsx';
import type { ComponentPropsWithoutRef } from 'react';

import './styles.scss';

interface ThemedIllustrationProps extends ComponentPropsWithoutRef< 'img' > {
	/** Illustration shown in light mode. */
	light: string;
	/** Illustration shown when the dashboard is in dark mode. */
	dark: string;
}

/**
 * Renders a light and a dark illustration and swaps between them based on the
 * dashboard's `data-theme` attribute (the in-app color scheme), so the artwork
 * tracks the color-scheme toggle rather than the OS `prefers-color-scheme`.
 *
 * Illustrations are imported as URLs and rendered as `<img>`, so CSS inside the
 * page cannot recolor them; shipping a separate dark asset and toggling which
 * one is visible is the way to make an `<img>`-rendered SVG theme-aware here.
 * Extra `<img>` props (width, height, style, …) pass through to both images.
 */
export function ThemedIllustration( {
	light,
	dark,
	alt = '',
	className,
	...props
}: ThemedIllustrationProps ) {
	return (
		<>
			<img
				src={ light }
				alt={ alt }
				className={ clsx(
					className,
					'dashboard-themed-illustration',
					'dashboard-themed-illustration--light'
				) }
				{ ...props }
			/>
			<img
				src={ dark }
				alt=""
				aria-hidden="true"
				className={ clsx(
					className,
					'dashboard-themed-illustration',
					'dashboard-themed-illustration--dark'
				) }
				{ ...props }
			/>
		</>
	);
}
