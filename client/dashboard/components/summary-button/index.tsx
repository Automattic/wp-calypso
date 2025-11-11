import SummaryButton from '@automattic/components/src/summary-button';
import type { SummaryButtonProps } from '@automattic/components/src/summary-button/types';
import './style.scss';

/**
 * This component is a wrapper of the `SummaryButton` component and adds a
 * `dashboard-summary-button` class to the component to handle responsive padding temporarily.
 * See https://github.com/Automattic/wp-dashboard/pull/107025 for more details.
 * @param props - The props for the SummaryButton component.
 * @returns The SummaryButton component.
 */
export default function DashboardSummaryButton( props: SummaryButtonProps ) {
	return <SummaryButton className="dashboard-summary-button" { ...props } />;
}
