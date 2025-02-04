import { Icon } from '@wordpress/icons';
import { clsx } from 'clsx';

interface SummaryStatProps {
	count?: number;
	icon?: JSX.Element | null;
	label: JSX.Element | string;
}

export default function SummaryStat( { count, icon, label }: SummaryStatProps ) {
	return (
		<div
			className={ clsx( 'summary__content-row', {
				'summary__content-indent': ! icon,
			} ) }
		>
			{ icon && <Icon icon={ icon } size={ 20 } className="summary__content-stats-icon" /> }
			<div className="summary__content-stats-label">{ label }</div>
			{ count !== undefined && <div className="summary__content-stats-count">{ count }</div> }
		</div>
	);
}
