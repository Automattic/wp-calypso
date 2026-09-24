import type { ComponentProps, CSSProperties } from 'react';

import './style.scss';

// The `--wpds-dimension-gap-*` token scale from `@wordpress/theme`.
export type GapSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

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
				gap: gap && `var( --wpds-dimension-gap-${ gap } )`,
				alignItems: align,
				...style,
			} }
		/>
	);
}
