import { useTranslate } from 'i18n-calypso';

const PlanRenewalMessage = (): JSX.Element => {
	const translate = useTranslate();

	return (
		<>
			{ translate(
				'We launched new plans and individual products that allow you to purchase only the parts of Jetpack you need. ' +
					'You can select one of our new plans, or keep your current plan.'
			) }
		</>
	);
};

export default PlanRenewalMessage;
