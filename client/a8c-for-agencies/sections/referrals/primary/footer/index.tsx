import { useTranslate } from 'i18n-calypso';

import './style.scss';

export default function ReferralsFooter() {
	const translate = useTranslate();

	const tosLink = ''; // FIXME: Add the correct link to the Terms of Service.

	return (
		<div className="referrals-footer">
			{ translate(
				"Every 60 days, we'll calculate and pay out your commissions based on your clients’ purchases. Read the {{a}}Terms of Service.{{/a}}",
				{
					components: {
						a: <a href={ tosLink } target="_blank" rel="noreferrer" />,
					},
				}
			) }
		</div>
	);
}
