import { DEVICE_TYPES } from '@automattic/components';
import {
	NEWSLETTER_FLOW,
	BUILD_FLOW,
	WRITE_FLOW,
	START_WRITING_FLOW,
	READYMADE_TEMPLATE_FLOW,
} from '@automattic/onboarding';
import SitePreview from '../../components/site-preview';

interface Props {
	siteSlug: string | null;
	flow: string | null;
}

const LaunchpadSitePreview = ( { siteSlug, flow }: Props ) => {
	const getSitePreviewDefaultDevice = ( flow: string | null ) => {
		switch ( flow ) {
			case NEWSLETTER_FLOW:
			case BUILD_FLOW:
			case WRITE_FLOW:
			case START_WRITING_FLOW:
			case READYMADE_TEMPLATE_FLOW:
				return DEVICE_TYPES.COMPUTER;
			default:
				return DEVICE_TYPES.PHONE;
		}
	};

	return (
		<SitePreview
			siteSlug={ siteSlug }
			defaultDevice={ getSitePreviewDefaultDevice( flow ) }
			showDeviceSwitcher
		/>
	);
};

export default LaunchpadSitePreview;
