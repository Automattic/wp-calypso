import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';

import './style.scss';

export interface StepCounterProps {
	current: number;
	total: number;
}

export const StepCounter = ( { current, total }: StepCounterProps ) => {
	const { __ } = useI18n();

	return (
		<span
			className="step-container-v2__step-counter"
			aria-label={ sprintf(
				/* translators: 1: current step number, 2: total number of steps. */
				__( 'Step %1$d of %2$d', __i18n_text_domain__ ),
				current,
				total
			) }
		>
			{ sprintf(
				/* translators: 1: current step number, 2: total number of steps. */
				__( '%1$d of %2$d', __i18n_text_domain__ ),
				current,
				total
			) }
		</span>
	);
};
