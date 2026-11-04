import clsx from 'clsx';
import type { ComponentProps } from 'react';

import './styles.scss';

interface ThemedIllustrationProps extends Omit< ComponentProps< 'img' >, 'src' > {
	light: string;
	dark: string;
}

/**
 * Renders both variants and lets the dashboard's `data-theme` attribute pick which one shows.
 * CSS can't recolor an SVG loaded through `<img>`, so dark mode needs its own asset. The hidden
 * variant is `display: none`, so screen readers announce the alt text only once, and with
 * `loading="lazy"` the browser never fetches it.
 */
export function ThemedIllustration( {
	light,
	dark,
	alt = '',
	className,
	...imgProps
}: ThemedIllustrationProps ) {
	return (
		<>
			<img
				loading="lazy"
				{ ...imgProps }
				src={ light }
				alt={ alt }
				className={ clsx(
					className,
					'dashboard-themed-illustration',
					'dashboard-themed-illustration--light'
				) }
			/>
			<img
				loading="lazy"
				{ ...imgProps }
				src={ dark }
				alt={ alt }
				className={ clsx(
					className,
					'dashboard-themed-illustration',
					'dashboard-themed-illustration--dark'
				) }
			/>
		</>
	);
}
