import FormattedHeader from 'calypso/components/formatted-header';
import HundredYearPlanStepWrapper from '../hundred-year-plan-step-wrapper';
import type { Step } from '../../types';

import './styles.scss';

const HundredYearPlanThankYou: Step = function HundredYearPlanThankYou( { flow } ) {
	return (
		<HundredYearPlanStepWrapper
			stepContent={
				<div>
					<p>TODO: Thank You content</p>
				</div>
			}
			formattedHeader={
				<FormattedHeader
					brandFont
					headerText="TODO: Thank You title"
					subHeaderText="TODO: Thank You header"
					subHeaderAlign="center"
				/>
			}
			stepName="hundred-year-plan-setup"
			flowName={ flow }
		/>
	);
};

export default HundredYearPlanThankYou;
