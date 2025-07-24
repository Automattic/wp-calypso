import SummaryButton from '@automattic/components/src/summary-button';
import { CardFooter } from '@wordpress/components';
import type { SummaryButtonProps } from '@automattic/components/src/summary-button/types';
import './style.scss';

export function SummaryButtonCardFooter( props: SummaryButtonProps ) {
	return (
		<CardFooter className="dashboard-summary-button-card-footer">
			<SummaryButton { ...props } />
		</CardFooter>
	);
}
