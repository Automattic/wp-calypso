import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getPlanKey, getPlanTier, PLAN_DISPLAY_NAMES } from './feature-data';
import FeatureDetailLayout, { type Benefit } from './feature-detail-layout';

const BENEFITS: Benefit[] = [
	{
		icon: 'share',
		title: 'Buttons appear on every post automatically',
		body: 'Sharing buttons are added to your posts and pages without you touching them individually — consistent across your whole site.',
	},
	{
		icon: 'visible',
		title: 'Your choice of networks',
		body: 'Choose which platforms to show: Facebook, X, LinkedIn, Reddit, WhatsApp, email, and more. Only show what your audience actually uses.',
	},
	{
		icon: 'stats-alt-2',
		title: 'Track what gets shared',
		body: 'Jetpack Stats shows you which posts are being shared most and to which networks, so you can see what content resonates.',
	},
];

export default function SocialSharingFeaturePage() {
	const translate = useTranslate();
	const site = useSelector( getSelectedSite );
	const siteSlug = useSelector( getSelectedSiteSlug ) ?? '';
	const currentPlan = useSelector( ( state ) => getCurrentPlan( state, site?.ID ) );

	const planTier = getPlanTier( currentPlan?.productSlug );
	const planKey = getPlanKey( planTier );

	const planCallout = translate( 'Social sharing is included on your %(planName)s plan.', {
		args: { planName: PLAN_DISPLAY_NAMES[ planKey ] },
	} );

	return (
		<FeatureDetailLayout
			featureId="social-sharing"
			icon="share"
			title="Make it easy for readers to share your content"
			subtitle="Add sharing buttons to every post so readers can share your content to their social networks with one click — helping you reach a wider audience."
			benefits={ BENEFITS }
			planCallout={ String( planCallout ) }
			ctaLabel="Configure sharing settings"
			ctaPath={ `/marketing/sharing/${ siteSlug }` }
			backPath={ `/jetpack-features/${ siteSlug }` }
		/>
	);
}
