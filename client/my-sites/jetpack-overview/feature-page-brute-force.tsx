import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getPlanKey, getPlanTier, PLAN_DISPLAY_NAMES } from './feature-data';
import FeatureDetailLayout, { type Benefit } from './feature-detail-layout';

const BENEFITS: Benefit[] = [
	{
		icon: 'lock',
		title: 'Protects every account on your site',
		body: 'Attackers can gain access through editors or contributors too. Jetpack protects every account automatically — not just the admin.',
	},
	{
		icon: 'stats-alt-2',
		title: 'See what has been blocked',
		body: 'The activity log shows you how many attacks have been stopped, so you have real visibility into what is happening behind the scenes.',
	},
	{
		icon: 'checkmark-circle',
		title: 'No configuration needed',
		body: 'Brute force protection is active as soon as Jetpack is connected. No rules to set, no lists to maintain.',
	},
];

export default function BruteForceFeaturePage() {
	const translate = useTranslate();
	const site = useSelector( getSelectedSite );
	const siteSlug = useSelector( getSelectedSiteSlug ) ?? '';
	const currentPlan = useSelector( ( state ) => getCurrentPlan( state, site?.ID ) );

	const planTier = getPlanTier( currentPlan?.productSlug );
	const planKey = getPlanKey( planTier );

	const planCallout = translate( 'Brute force protection is included on your %(planName)s plan.', {
		args: { planName: PLAN_DISPLAY_NAMES[ planKey ] },
	} );

	return (
		<FeatureDetailLayout
			featureId="brute-force"
			icon="lock"
			title="Stop login attacks before they start"
			subtitle="Jetpack monitors every login attempt and automatically blocks IP addresses showing signs of a brute force attack — protecting every account on your site."
			benefits={ BENEFITS }
			planCallout={ String( planCallout ) }
			ctaLabel="View security activity"
			ctaPath={ `/scan/${ siteSlug }` }
			backPath={ `/jetpack-features/${ siteSlug }` }
		/>
	);
}
