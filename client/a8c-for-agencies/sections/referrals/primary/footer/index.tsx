import { useTranslate } from 'i18n-calypso';

import './style.scss';

export default function ReferralsFooter() {
	const translate = useTranslate();

	const link =
		'https://agencieshelp.automattic.com/knowledge-base/about-automattic-for-agencies/#payout-calculation-and-schedule';

	return (
		<div className="referrals-footer">
			{ translate(
				'Payments are issued once a quarter with 60 day terms and are net of refunds and chargebacks. See the {{a}}payout schedule{{/a}} for more exact dates.',
				{
					components: {
						a: <a href={ link } target="_blank" rel="noreferrer" />,
					},
				}
			) }
		</div>
	);
}
