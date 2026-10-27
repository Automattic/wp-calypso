import type { ComponentProps, CSSProperties } from 'react';

// Local fallbacks rather than importing `@wordpress/theme/design-tokens.css`: loaded lazily,
// that stylesheet resets Calypso's `:root` token overrides (e.g. the 499 emphasis weight).
const GAP_FALLBACKS = {
	xs: '4px',
	sm: '8px',
	md: '12px',
	lg: '16px',
	xl: '24px',
	'2xl': '32px',
	'3xl': '40px',
};

export type GapSize = keyof typeof GAP_FALLBACKS;

interface GridProps extends ComponentProps< 'div' > {
	columns?: number;
	rows?: number;
	templateColumns?: string;
	templateRows?: string;
	gap?: GapSize;
	align?: CSSProperties[ 'alignItems' ];
}

export default function Grid( {
	columns,
	rows,
	templateColumns,
	templateRows,
	gap,
	align,
	style,
	...props
}: GridProps ) {
	return (
		<div
			{ ...props }
			style={ {
				display: 'grid',
				gridTemplateColumns:
					templateColumns ?? ( columns ? `repeat( ${ columns }, 1fr )` : undefined ),
				gridTemplateRows: templateRows ?? ( rows ? `repeat( ${ rows }, 1fr )` : undefined ),
				gap: gap && `var( --wpds-dimension-gap-${ gap }, ${ GAP_FALLBACKS[ gap ] } )`,
				alignItems: align,
				...style,
			} }
		/>
	);
}
