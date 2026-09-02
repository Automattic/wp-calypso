import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getPlanKey, getPlanTier, PLAN_DISPLAY_NAMES } from './feature-data';
import FeatureDetailLayout, { type Benefit } from './feature-detail-layout';

const BENEFITS: Benefit[] = [
	{
		icon: 'cloud-upload',
		title: 'Automatic daily backups',
		body: 'Your entire site is backed up every 24 hours without you lifting a finger — no scheduling or configuration needed.',
	},
	{
		icon: 'history',
		title: 'Restore to any point in time',
		body: 'If a plugin update, a hack, or a bad edit breaks something, roll back to any previous backup with one click.',
	},
	{
		icon: 'lock',
		title: 'Stored safely off-site',
		body: "Backups are kept on Jetpack's infrastructure, separate from your hosting — so they survive even if your host goes down.",
	},
];

export default function BackupsFeaturePage() {
	const translate = useTranslate();
	const site = useSelector( getSelectedSite );
	const siteSlug = useSelector( getSelectedSiteSlug ) ?? '';
	const currentPlan = useSelector( ( state ) => getCurrentPlan( state, site?.ID ) );

	const planTier = getPlanTier( currentPlan?.productSlug );
	const planKey = getPlanKey( planTier );

	const planCallout =
		planTier >= 3
			? translate( 'Your %(planName)s plan includes daily automated backups.', {
					args: { planName: PLAN_DISPLAY_NAMES[ planKey ] },
			  } )
			: translate( 'Automated backups are available on the Business plan and above.' );

	return (
		<FeatureDetailLayout
			featureId="automated-backups"
			icon="cloud-upload"
			title="Never lose your site again"
			subtitle="Jetpack backs up your entire site every day and stores it safely off-site — so you can restore it in minutes if anything goes wrong."
			benefits={ BENEFITS }
			planCallout={ String( planCallout ) }
			ctaLabel="View your backups"
			ctaPath={ `/backup/${ siteSlug }` }
			backPath={ `/jetpack-features/${ siteSlug }` }
		/>
	);
}
