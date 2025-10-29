import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { CardFooter } from '../card';
import type { SummaryButtonProps } from '@automattic/components/src/summary-button/types';
import './style.scss';

export function SummaryButtonCardFooter( { href, density, onClick, title }: SummaryButtonProps ) {
	return (
		<CardFooter className="dashboard-summary-button-card-footer">
			<RouterLinkSummaryButton
				to={ href }
				density={ density }
				onClick={ onClick }
				title={ title }
			/>
		</CardFooter>
	);
}
