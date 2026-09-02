import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getPlanKey, getPlanTier, PLAN_DISPLAY_NAMES } from './feature-data';
import FeatureDetailLayout, { type Benefit } from './feature-detail-layout';

const BENEFITS: Benefit[] = [
	{
		icon: 'bell',
		title: 'Instant email alerts',
		body: 'The moment your site stops responding, you get an email — so you can investigate immediately, even in the middle of the night.',
	},
	{
		icon: 'time',
		title: 'Checked every minute, around the clock',
		body: 'Jetpack makes continuous checks 24 hours a day. Downtime is caught within minutes, not hours.',
	},
	{
		icon: 'history',
		title: 'A record of every incident',
		body: 'See a history of past downtime so you can identify patterns, understand causes, and seek support if needed.',
	},
];

export default function UptimeMonitoringFeaturePage() {
	const translate = useTranslate();
	const site = useSelector( getSelectedSite );
	const siteSlug = useSelector( getSelectedSiteSlug ) ?? '';
	const currentPlan = useSelector( ( state ) => getCurrentPlan( state, site?.ID ) );

	const planTier = getPlanTier( currentPlan?.productSlug );
	const planKey = getPlanKey( planTier );

	const planCallout = translate( 'Uptime monitoring is included on your %(planName)s plan.', {
		args: { planName: PLAN_DISPLAY_NAMES[ planKey ] },
	} );

	return (
		<FeatureDetailLayout
			featureId="uptime-monitoring"
			icon="bell"
			title="Know the moment your site goes down"
			subtitle="Jetpack checks your site every minute and sends an instant email alert if it becomes unreachable — so you can act before your visitors even notice."
			benefits={ BENEFITS }
			planCallout={ String( planCallout ) }
			backPath={ `/jetpack-features/${ siteSlug }` }
		/>
	);
}
