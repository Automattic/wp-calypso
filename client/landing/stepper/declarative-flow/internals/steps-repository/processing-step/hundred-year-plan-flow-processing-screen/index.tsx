import { useTranslate } from 'i18n-calypso';

import './style.scss';

export default function HundredYearPlanFlowProcessingScreen() {
	const translate = useTranslate();
	return (
		<div className="hundred-year-plan-flow-processing-screen__container">
			<h1 className="wp-brand-font">{ translate( 'Setting up your legacy…' ) }</h1>
		</div>
	);
}
