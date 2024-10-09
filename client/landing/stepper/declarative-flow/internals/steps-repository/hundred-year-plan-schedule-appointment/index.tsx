import config from '@automattic/calypso-config';
import { UserSelect } from '@automattic/data-stores';
import { useSelect } from '@wordpress/data';
import FormattedHeader from 'calypso/components/formatted-header';
import { USER_STORE } from '../../../../stores';
import CalendlyWidget from '../components/calendy-widget';
import HundredYearPlanStepWrapper from '../hundred-year-plan-step-wrapper';
import type { Step } from '../../types';

import './styles.scss';

const HundredYearPlanScheduleAppointment: Step = function HundredYearPlanScheduleAppointment( {
	navigation,
	flow,
} ) {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { submit } = navigation;

	const currentUser = useSelect(
		( select ) => ( select( USER_STORE ) as UserSelect ).getCurrentUser(),
		[]
	);

	return (
		<HundredYearPlanStepWrapper
			stepContent={
				<div className="hundred-year-plan-schedule-appointment-content">
					<div className="hundred-year-plan-schedule-appointment-content__start-pane">
						// TODO: content
					</div>
					<div className="hundred-year-plan-schedule-appointment-content__end-pane">
						<CalendlyWidget
							url={ config( '100_year_plan_calendly_id' ) }
							prefill={
								currentUser
									? { name: currentUser?.display_name, email: currentUser?.email }
									: undefined
							}
							onSchedule={ () => {
								submit?.();
							} }
						/>
					</div>
				</div>
			}
			formattedHeader={
				<FormattedHeader
					brandFont
					headerText="TODO: title"
					subHeaderText="TODO: header"
					subHeaderAlign="center"
				/>
			}
			stepName="hundred-year-plan-setup"
			flowName={ flow }
		/>
	);
};

export default HundredYearPlanScheduleAppointment;
