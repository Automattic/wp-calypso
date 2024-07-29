import { useTranslate } from 'i18n-calypso';
import LayoutBanner from 'calypso/a8c-for-agencies/components/layout/banner';

export default function AutomatedReferralComingSoonBanner() {
	const translate = useTranslate();

	return (
		<LayoutBanner
			title={ translate( 'A better referrals experience is on the way!' ) }
			level="info"
			preferenceName="a8c-automated-referral-coming-soon"
		>
			{ translate(
				`Soon, you will have the ability to gather products and hosting for your clients. Send payment requests. Earn commissions. Track your clients' details. All from within your Automattic for Agencies Dashboard!`
			) }
		</LayoutBanner>
	);
}
