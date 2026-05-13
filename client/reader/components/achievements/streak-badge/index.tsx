import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

type StreakBadgeState = 'active-engaged' | 'active-pending' | 'inactive' | 'frozen';

interface StreakBadgeProps {
	streak: number;
	state: StreakBadgeState;
}

export const StreakBadge = ( { streak, state }: StreakBadgeProps ): JSX.Element => {
	const translate = useTranslate();

	const className = clsx( 'streak-badge', `is-${ state }` );
	const digits = Math.min( String( streak ).length, 4 );

	return (
		<div className={ className }>
			<div className="streak-badge__circle" data-digits={ digits }>
				{ streak }
			</div>
			<span className="streak-badge__label">
				{ translate( 'Day streak', 'Day streak', { count: streak } ) }
			</span>
		</div>
	);
};
