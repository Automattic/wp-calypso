import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getPlanKey, getPlanTier, PLAN_DISPLAY_NAMES } from './feature-data';
import FeatureDetailLayout, { type Benefit } from './feature-detail-layout';

const BENEFITS: Benefit[] = [
	{
		icon: 'search',
		title: 'Spot problems the moment they happen',
		body: 'When something breaks or looks wrong, you can pinpoint exactly what changed and when — no more guessing.',
	},
	{
		icon: 'user',
		title: 'Know who changed what',
		body: 'Every login, edit, plugin install, and setting change is recorded by user, so nothing happens invisibly.',
	},
	{
		icon: 'history',
		title: 'A timeline you can act on',
		body: 'Pair the activity log with backups to restore your site to any point in time — right before a change went wrong.',
	},
];

export default function ActivityLogFeaturePage() {
	const translate = useTranslate();
	const site = useSelector( getSelectedSite );
	const siteSlug = useSelector( getSelectedSiteSlug ) ?? '';
	const currentPlan = useSelector( ( state ) => getCurrentPlan( state, site?.ID ) );

	const planTier = getPlanTier( currentPlan?.productSlug );
	const planKey = getPlanKey( planTier );

	const planCallout =
		planTier <= 1
			? translate( 'Your %(planName)s plan includes the last 20 events.', {
					args: { planName: PLAN_DISPLAY_NAMES[ planKey ] },
			  } )
			: translate( 'Your %(planName)s plan includes full activity history.', {
					args: { planName: PLAN_DISPLAY_NAMES[ planKey ] },
			  } );

	return (
		<FeatureDetailLayout
			featureId="activity-log"
			icon="history"
			title="See everything that happens on your site"
			subtitle="The activity log keeps a running record of every significant change — so you always know what happened, when, and who did it."
			benefits={ BENEFITS }
			planCallout={ String( planCallout ) }
			ctaLabel="View your activity log"
			ctaPath={ `/activity-log/${ siteSlug }` }
			backPath={ `/jetpack-features/${ siteSlug }` }
		/>
	);
}
