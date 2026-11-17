import clsx from 'clsx';
import type { FunctionComponent } from 'react';

import './skeleton.scss';

interface SkeletonProps {
	className?: string;
}

/**
 * A pulsing bar the shape of the content it stands in for. Hidden from assistive technology:
 * the section says "Loading…" once, rather than once per bar.
 */
const Skeleton: FunctionComponent< SkeletonProps > = ( { className } ) => (
	<span className={ clsx( 'stats-widget-skeleton', className ) } aria-hidden="true" />
);

export default Skeleton;
