import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import type { JSX } from 'react';

import './style.scss';

export type StreakBadgeState = 'inactive' | 'active' | 'longest-active' | 'frozen';

interface StreakBadgeProps {
	streak: number;
	state: StreakBadgeState;
	label?: string;
}

export const StreakBadge = ( { streak, state, label }: StreakBadgeProps ): JSX.Element => {
	const translate = useTranslate();

	const className = clsx( 'streak-badge', `is-${ state }` );
	const digits = Math.min( String( streak ).length, 4 );

	return (
		<div className={ className }>
			<div className="streak-badge__circle" data-digits={ digits }>
				{ streak }
			</div>
			<span className="streak-badge__label">{ label ?? translate( 'Active Streak' ) }</span>
		</div>
	);
};
