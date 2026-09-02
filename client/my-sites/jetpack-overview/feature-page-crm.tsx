import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getPlanKey, getPlanTier, PLAN_DISPLAY_NAMES } from './feature-data';
import FeatureDetailLayout, { type Benefit } from './feature-detail-layout';

const BENEFITS: Benefit[] = [
	{
		icon: 'user',
		title: 'All your contacts in one place',
		body: 'Store and manage every lead, customer, and contact alongside your WordPress site — no separate CRM software or subscriptions needed.',
	},
	{
		icon: 'mail',
		title: 'Log every conversation',
		body: 'Keep a full history of emails, calls, and notes for each contact, so nothing falls through the cracks.',
	},
	{
		icon: 'list-checkmark',
		title: 'Invoices and transactions',
		body: 'Create and send invoices, track transactions, and manage your billing — all from within WordPress.',
	},
];

export default function CrmFeaturePage() {
	const translate = useTranslate();
	const site = useSelector( getSelectedSite );
	const siteSlug = useSelector( getSelectedSiteSlug ) ?? '';
	const currentPlan = useSelector( ( state ) => getCurrentPlan( state, site?.ID ) );

	const planTier = getPlanTier( currentPlan?.productSlug );
	const planKey = getPlanKey( planTier );

	const planCallout =
		planTier >= 3
			? translate( 'Your %(planName)s plan includes Jetpack CRM (Entrepreneur plan).', {
					args: { planName: PLAN_DISPLAY_NAMES[ planKey ] },
			  } )
			: translate( 'Jetpack CRM is available on the Business plan and above.' );

	return (
		<FeatureDetailLayout
			featureId="crm"
			icon="user"
			title="Manage your customers and contacts in WordPress"
			subtitle="Jetpack CRM turns your WordPress site into a lightweight CRM — track leads, log conversations, and send invoices, all without leaving your admin."
			benefits={ BENEFITS }
			planCallout={ String( planCallout ) }
			backPath={ `/jetpack-features/${ siteSlug }` }
		/>
	);
}
