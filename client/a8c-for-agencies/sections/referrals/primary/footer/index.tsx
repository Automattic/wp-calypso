import { useTranslate } from 'i18n-calypso';

import './style.scss';

export default function ReferralsFooter() {
	const translate = useTranslate();

	const link = 'https://automattic.com/for-agencies/program-incentives/';

	return (
		<div className="referrals-footer">
			{ translate(
				"Every 60 days, we'll calculate and pay out your commissions based on your clients’ purchases. Learn more about {{a}}partner earnings.{{/a}}",
				{
					components: {
						a: <a href={ link } target="_blank" rel="noreferrer" />,
					},
				}
			) }
		</div>
	);
}
