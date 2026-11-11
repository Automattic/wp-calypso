import DashboardGrid, { type GapSize } from '../../components/grid';
import type { ComponentProps } from 'react';

// Prototype: the overviews were written against `__experimentalGrid`, whose
// `gap` is a number of 4px steps. Map it to the dashboard Grid's gap tokens.
const GAP_BY_STEPS: Record< number, GapSize > = {
	1: 'xs',
	2: 'sm',
	3: 'md',
	4: 'lg',
	5: 'lg',
	6: 'xl',
	8: '2xl',
	10: '3xl',
};

type Props = Omit< ComponentProps< typeof DashboardGrid >, 'gap' > & { gap?: number | GapSize };

export default function Grid( { gap, ...props }: Props ) {
	const token = typeof gap === 'number' ? ( GAP_BY_STEPS[ gap ] ?? 'lg' ) : gap;
	return <DashboardGrid gap={ token } { ...props } />;
}
