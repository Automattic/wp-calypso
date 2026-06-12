import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getPlanKey, getPlanTier, PLAN_DISPLAY_NAMES } from './feature-data';
import FeatureDetailLayout, { type Benefit } from './feature-detail-layout';

const BENEFITS: Benefit[] = [
	{
		icon: 'time',
		title: 'Images load faster for everyone',
		body: 'Images are served from a CDN node close to each visitor, dramatically cutting load times compared to serving directly from your host.',
	},
	{
		icon: 'image',
		title: 'Automatically resized for every device',
		body: 'Jetpack sends the right image size for each device. Mobile visitors never download desktop-sized images, saving their data and your bandwidth.',
	},
	{
		icon: 'globe',
		title: 'Global coverage, no extra cost',
		body: "Jetpack's image CDN has nodes around the world. Visitors in Australia load your images just as fast as visitors in London.",
	},
];

export default function ImageCdnFeaturePage() {
	const translate = useTranslate();
	const site = useSelector( getSelectedSite );
	const siteSlug = useSelector( getSelectedSiteSlug ) ?? '';
	const currentPlan = useSelector( ( state ) => getCurrentPlan( state, site?.ID ) );

	const planTier = getPlanTier( currentPlan?.productSlug );
	const planKey = getPlanKey( planTier );

	const planCallout = translate( 'Image CDN is included on your %(planName)s plan.', {
		args: { planName: PLAN_DISPLAY_NAMES[ planKey ] },
	} );

	return (
		<FeatureDetailLayout
			featureId="image-cdn"
			icon="image"
			title="Your images, served fast everywhere in the world"
			subtitle="Jetpack automatically delivers your images from a global CDN, so they load quickly for every visitor regardless of where they are."
			benefits={ BENEFITS }
			planCallout={ String( planCallout ) }
			backPath={ `/jetpack-features/${ siteSlug }` }
		/>
	);
}
