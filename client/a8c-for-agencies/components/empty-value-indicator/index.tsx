import { Gridicon } from '@automattic/components';
import clsx from 'clsx';

import './style.scss';

type Props = {
	className?: string;
};

/**
 * Shared "no value" placeholder for A4A tables. Renders the minus glyph used
 * across the portal in a dimmed gray so empty cells don't compete with real
 * data. See A4A-2640.
 */
export default function EmptyValueIndicator( { className }: Props ) {
	return <Gridicon icon="minus" className={ clsx( 'a4a-empty-value-indicator', className ) } />;
}
