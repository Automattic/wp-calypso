import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { Text } from '@wordpress/ui';

import './style.scss';

export interface StepCounterProps {
	current: number;
	total: number;
}

/**
 * The compact "1 of 3" progress indicator in the top bar.
 *
 * Shown when the viewport is too narrow to carry the named step rail. The two
 * are the same type on purpose: rather than restate 13px / 20px / 400 in CSS,
 * this goes through the same `Text` variant that `Stepper.Title` renders, so
 * the two treatments cannot drift apart when the token changes.
 *
 * `Text` renders a span by default, which is what this was before.
 */
export const StepCounter = ( { current, total }: StepCounterProps ) => {
	const { __ } = useI18n();

	return (
		<Text
			variant="body-md"
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
		</Text>
	);
};
