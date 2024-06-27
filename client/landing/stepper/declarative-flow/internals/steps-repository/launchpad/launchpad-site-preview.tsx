import { FEATURE_VIDEO_UPLOADS, planHasFeature } from '@automattic/calypso-products';
import { DEVICE_TYPES } from '@automattic/components';
import {
	FREE_FLOW,
	NEWSLETTER_FLOW,
	BUILD_FLOW,
	WRITE_FLOW,
	START_WRITING_FLOW,
	DESIGN_FIRST_FLOW,
	VIDEOPRESS_FLOW,
	VIDEOPRESS_ACCOUNT,
	ASSEMBLER_FIRST_FLOW,
	READYMADE_TEMPLATE_FLOW,
	AI_ASSEMBLER_FLOW,
	isVideoPressFlow,
} from '@automattic/onboarding';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import SitePreview from '../../components/site-preview';

interface Props {
	siteSlug: string | null;
	flow: string | null;
}

const LaunchpadSitePreview = ( { siteSlug, flow }: Props ) => {
	const site = useSite();
	const isInVideoPressFlow = isVideoPressFlow( flow );

	const getSitePreviewDefaultDevice = ( flow: string | null ) => {
		switch ( flow ) {
			case NEWSLETTER_FLOW:
			case FREE_FLOW:
			case BUILD_FLOW:
			case WRITE_FLOW:
			case START_WRITING_FLOW:
			case DESIGN_FIRST_FLOW:
			case ASSEMBLER_FIRST_FLOW:
			case READYMADE_TEMPLATE_FLOW:
			case AI_ASSEMBLER_FLOW:
				return DEVICE_TYPES.COMPUTER;
			case VIDEOPRESS_FLOW:
			case VIDEOPRESS_ACCOUNT:
				return window.innerWidth >= 1000 ? DEVICE_TYPES.COMPUTER : DEVICE_TYPES.PHONE;
			default:
				return DEVICE_TYPES.PHONE;
		}
	};

	return (
		<SitePreview
			siteSlug={ siteSlug }
			isUnsupportedPlan={
				isInVideoPressFlow &&
				! planHasFeature( site?.plan?.product_slug as string, FEATURE_VIDEO_UPLOADS )
			}
			defaultDevice={ getSitePreviewDefaultDevice( flow ) }
			showDeviceSwitcher
			enableInteractions={ isInVideoPressFlow }
		/>
	);
};

export default LaunchpadSitePreview;
