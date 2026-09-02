import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getPlanKey, getPlanTier, PLAN_DISPLAY_NAMES } from './feature-data';
import FeatureDetailLayout, { type Benefit } from './feature-detail-layout';

const BENEFITS: Benefit[] = [
	{
		icon: 'block',
		title: 'Blocks common attack patterns',
		body: 'Protects against SQL injection, cross-site scripting, and other attacks that exploit vulnerabilities in WordPress themes and plugins.',
	},
	{
		icon: 'refresh',
		title: 'Rules updated automatically',
		body: "Jetpack's security team continuously updates firewall rules as new vulnerabilities are discovered — you're always protected against the latest threats.",
	},
	{
		icon: 'lock',
		title: 'Your entire site is covered',
		body: 'The firewall covers every page, form, and API endpoint — not just the login page. Malicious requests are stopped before they reach WordPress.',
	},
];

export default function WafFeaturePage() {
	const translate = useTranslate();
	const site = useSelector( getSelectedSite );
	const siteSlug = useSelector( getSelectedSiteSlug ) ?? '';
	const currentPlan = useSelector( ( state ) => getCurrentPlan( state, site?.ID ) );

	const planTier = getPlanTier( currentPlan?.productSlug );
	const planKey = getPlanKey( planTier );

	const planCallout =
		planTier >= 3
			? translate( 'Your %(planName)s plan includes the web application firewall.', {
					args: { planName: PLAN_DISPLAY_NAMES[ planKey ] },
			  } )
			: translate( 'The web application firewall is available on the Business plan and above.' );

	return (
		<FeatureDetailLayout
			featureId="waf"
			icon="block"
			title="A firewall between your site and the internet"
			subtitle="Jetpack's web application firewall analyses every request and blocks malicious traffic — SQL injection, XSS, and more — before it ever reaches WordPress."
			benefits={ BENEFITS }
			planCallout={ String( planCallout ) }
			ctaLabel="View security scan"
			ctaPath={ `/scan/${ siteSlug }` }
			backPath={ `/jetpack-features/${ siteSlug }` }
		/>
	);
}
