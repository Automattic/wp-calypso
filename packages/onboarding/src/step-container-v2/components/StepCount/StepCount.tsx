import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';

import './style.scss';

export interface StepCountProps {
	current: number;
	total: number;
}

export const StepCount = ( { current, total }: StepCountProps ) => {
	const { __ } = useI18n();
	const label = sprintf(
		/* translators: 1: current step number, 2: total step count */
		__( '%1$d of %2$d' ),
		current,
		total
	);

	return <span className="step-container-v2__step-count">{ label }</span>;
};
