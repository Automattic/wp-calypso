import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getPlanKey, getPlanTier, PLAN_DISPLAY_NAMES } from './feature-data';
import FeatureDetailLayout, { type Benefit } from './feature-detail-layout';

const BENEFITS: Benefit[] = [
	{
		icon: 'search',
		title: 'Control how you appear in search results',
		body: 'Set a custom title and description for every page and post, so search engines and social previews show exactly what you want.',
	},
	{
		icon: 'list-checkmark',
		title: 'Automatic sitemaps',
		body: 'Jetpack generates and submits a sitemap to search engines so every page gets discovered and indexed.',
	},
	{
		icon: 'code',
		title: 'Structured data built in',
		body: 'Automatic schema markup helps search engines understand your content — no plugins or technical knowledge required.',
	},
];

export default function SeoFeaturePage() {
	const translate = useTranslate();
	const site = useSelector( getSelectedSite );
	const siteSlug = useSelector( getSelectedSiteSlug ) ?? '';
	const currentPlan = useSelector( ( state ) => getCurrentPlan( state, site?.ID ) );

	const planTier = getPlanTier( currentPlan?.productSlug );
	const planKey = getPlanKey( planTier );

	const planCallout =
		planTier >= 3
			? translate( 'Your %(planName)s plan includes full SEO tools.', {
					args: { planName: PLAN_DISPLAY_NAMES[ planKey ] },
			  } )
			: translate( 'SEO tools are available on the Business plan and above.' );

	return (
		<FeatureDetailLayout
			featureId="seo-tools"
			icon="search"
			title="Help people find you on search engines"
			subtitle="Jetpack's SEO tools make it easy to control how your site appears in Google and other search engines — without needing to be a technical expert."
			benefits={ BENEFITS }
			planCallout={ String( planCallout ) }
			ctaLabel="Manage SEO settings"
			ctaPath={ `/marketing/traffic/${ siteSlug }` }
			backPath={ `/jetpack-features/${ siteSlug }` }
		/>
	);
}
