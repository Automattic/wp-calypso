import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getPlanKey, getPlanTier, PLAN_DISPLAY_NAMES } from './feature-data';
import FeatureDetailLayout, { type Benefit } from './feature-detail-layout';

const BENEFITS: Benefit[] = [
	{
		icon: 'mail',
		title: 'Simple to add anywhere',
		body: 'Drop the Jetpack Form block into any post or page. No plugins, no shortcodes, no coding — just a clean form wherever you need one.',
	},
	{
		icon: 'spam',
		title: 'Spam protection built in',
		body: 'Submissions are automatically checked by Akismet so your inbox stays clean and you only ever see genuine messages.',
	},
	{
		icon: 'list-checkmark',
		title: 'Submissions saved in your dashboard',
		body: 'Every response is stored in WordPress as well as emailed to you, so you never lose a message even if your email is down.',
	},
];

export default function ContactFormFeaturePage() {
	const translate = useTranslate();
	const site = useSelector( getSelectedSite );
	const siteSlug = useSelector( getSelectedSiteSlug ) ?? '';
	const currentPlan = useSelector( ( state ) => getCurrentPlan( state, site?.ID ) );

	const planTier = getPlanTier( currentPlan?.productSlug );
	const planKey = getPlanKey( planTier );

	const planCallout = translate( 'Contact forms are included on your %(planName)s plan.', {
		args: { planName: PLAN_DISPLAY_NAMES[ planKey ] },
	} );

	return (
		<FeatureDetailLayout
			featureId="contact-form"
			icon="mail"
			title="A contact form that just works"
			subtitle="Add a contact form to any page with the Jetpack Form block — with spam filtering built in and every submission saved to your dashboard."
			benefits={ BENEFITS }
			planCallout={ String( planCallout ) }
			backPath={ `/jetpack-features/${ siteSlug }` }
		/>
	);
}
