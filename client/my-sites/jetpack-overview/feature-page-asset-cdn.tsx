import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getPlanKey, getPlanTier, PLAN_DISPLAY_NAMES } from './feature-data';
import FeatureDetailLayout, { type Benefit } from './feature-detail-layout';

const BENEFITS: Benefit[] = [
	{
		icon: 'time',
		title: 'Pages render faster',
		body: 'CSS and JS files are served from edge nodes close to your visitors — fewer round trips to your server means pages appear sooner.',
	},
	{
		icon: 'computer',
		title: 'Less load on your server',
		body: 'Offloading static asset delivery frees your server to focus on generating dynamic content, improving responsiveness during traffic spikes.',
	},
	{
		icon: 'cog',
		title: 'Works automatically',
		body: 'No configuration needed. Jetpack detects eligible assets and serves them from the CDN as soon as the feature is enabled.',
	},
];

export default function AssetCdnFeaturePage() {
	const translate = useTranslate();
	const site = useSelector( getSelectedSite );
	const siteSlug = useSelector( getSelectedSiteSlug ) ?? '';
	const currentPlan = useSelector( ( state ) => getCurrentPlan( state, site?.ID ) );

	const planTier = getPlanTier( currentPlan?.productSlug );
	const planKey = getPlanKey( planTier );

	const planCallout = translate( 'Static asset CDN is included on your %(planName)s plan.', {
		args: { planName: PLAN_DISPLAY_NAMES[ planKey ] },
	} );

	return (
		<FeatureDetailLayout
			featureId="asset-cdn"
			icon="code"
			title="Faster pages with smarter asset delivery"
			subtitle="Jetpack serves your site's JavaScript and CSS from a global CDN, reducing server load and speeding up every page for every visitor."
			benefits={ BENEFITS }
			planCallout={ String( planCallout ) }
			backPath={ `/jetpack-features/${ siteSlug }` }
		/>
	);
}
