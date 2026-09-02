import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getPlanKey, getPlanTier, PLAN_DISPLAY_NAMES } from './feature-data';
import FeatureDetailLayout, { type Benefit } from './feature-detail-layout';

const BENEFITS: Benefit[] = [
	{
		icon: 'share',
		title: 'Share to all your networks at once',
		body: 'Post to X, Facebook, LinkedIn, Tumblr, and more — all automatically the moment you hit publish.',
	},
	{
		icon: 'time',
		title: 'Save hours every week',
		body: 'No more copy-pasting links or logging in to each network. Jetpack handles it so you can focus on writing.',
	},
	{
		icon: 'visible',
		title: 'Reach more people',
		body: 'Consistent sharing grows your social following and brings readers back to your site every time you publish.',
	},
];

export default function SocialFeaturePage() {
	const translate = useTranslate();
	const site = useSelector( getSelectedSite );
	const siteSlug = useSelector( getSelectedSiteSlug ) ?? '';
	const currentPlan = useSelector( ( state ) => getCurrentPlan( state, site?.ID ) );

	const planTier = getPlanTier( currentPlan?.productSlug );
	const planKey = getPlanKey( planTier );

	let planCallout;
	if ( planTier >= 2 ) {
		planCallout = translate( 'Your %(planName)s plan includes unlimited social connections.', {
			args: { planName: PLAN_DISPLAY_NAMES[ planKey ] },
		} );
	} else if ( planTier === 1 ) {
		planCallout = translate(
			'Your %(planName)s plan includes one social connection. Upgrade for more.',
			{
				args: { planName: PLAN_DISPLAY_NAMES[ planKey ] },
			}
		);
	} else {
		planCallout = translate( 'Social auto-posting is available on the Personal plan and above.' );
	}

	return (
		<FeatureDetailLayout
			featureId="social-auto-posting"
			icon="share"
			title="Publish once, share everywhere"
			subtitle="Connect your social accounts and Jetpack will automatically share every new post — so your audience on every platform hears from you."
			benefits={ BENEFITS }
			planCallout={ String( planCallout ) }
			ctaLabel="Connect your social accounts"
			ctaPath={ `/marketing/connections/${ siteSlug }` }
			backPath={ `/jetpack-features/${ siteSlug }` }
		/>
	);
}
