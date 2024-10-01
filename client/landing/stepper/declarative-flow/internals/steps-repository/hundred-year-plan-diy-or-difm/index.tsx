import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import FormattedHeader from 'calypso/components/formatted-header';
import HundredYearPlanStepWrapper from '../hundred-year-plan-step-wrapper';
import type { Step } from '../../types';

import './styles.scss';

const HundredYearPlanDIYOrDIFM: Step = function HundredYearPlanDIYOrDIFM( { navigation, flow } ) {
	const { submit } = navigation;
	const translate = useTranslate();

	return (
		<HundredYearPlanStepWrapper
			stepContent={
				<div>
					<Button onClick={ () => submit?.( { diyOrDifmChoice: 'difm' } ) }>Do it for me</Button>
					<Button onClick={ () => submit?.( { diyOrDifmChoice: 'diy' } ) }>Do it myself</Button>
				</div>
			}
			formattedHeader={
				<FormattedHeader
					brandFont
					headerText={ translate( 'TODO: title' ) }
					subHeaderText={ translate( 'TODO: header' ) }
					subHeaderAlign="center"
				/>
			}
			stepName="hundred-year-plan-setup"
			flowName={ flow }
		/>
	);
};

export default HundredYearPlanDIYOrDIFM;
