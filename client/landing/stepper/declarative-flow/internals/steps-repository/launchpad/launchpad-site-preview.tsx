import { DEVICE_TYPES } from '@automattic/components';
import {
	FREE_FLOW,
	NEWSLETTER_FLOW,
	BUILD_FLOW,
	WRITE_FLOW,
	START_WRITING_FLOW,
	DESIGN_FIRST_FLOW,
	ASSEMBLER_FIRST_FLOW,
	READYMADE_TEMPLATE_FLOW,
	AI_ASSEMBLER_FLOW,
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
			case FREE_FLOW:
			case BUILD_FLOW:
			case WRITE_FLOW:
			case START_WRITING_FLOW:
			case DESIGN_FIRST_FLOW:
			case ASSEMBLER_FIRST_FLOW:
			case READYMADE_TEMPLATE_FLOW:
			case AI_ASSEMBLER_FLOW:
				return DEVICE_TYPES.COMPUTER;
			default:
				return DEVICE_TYPES.PHONE;
		}
	};

	return (
		<SitePreview
			siteSlug={ siteSlug }
			isUnsupportedPlan={ false }
			defaultDevice={ getSitePreviewDefaultDevice( flow ) }
			showDeviceSwitcher
			enableInteractions={ false }
		/>
	);
};

export default LaunchpadSitePreview;
