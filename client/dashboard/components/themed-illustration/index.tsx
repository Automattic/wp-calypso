import clsx from 'clsx';

import './styles.scss';

interface ThemedIllustrationProps {
	/** Illustration shown in light mode. */
	light: string;
	/** Illustration shown when the dashboard is in dark mode. */
	dark: string;
	alt?: string;
	className?: string;
}

/**
 * Renders a light and a dark illustration and swaps between them based on the
 * dashboard's `data-theme` attribute (the in-app color scheme), so the artwork
 * tracks the color-scheme toggle rather than the OS `prefers-color-scheme`.
 *
 * Illustrations are imported as URLs and rendered as `<img>`, so CSS inside the
 * page cannot recolor them; shipping a separate dark asset and toggling which
 * one is visible is the way to make an `<img>`-rendered SVG theme-aware here.
 */
export function ThemedIllustration( {
	light,
	dark,
	alt = '',
	className,
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
			/>
		</>
	);
}
