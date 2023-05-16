import { VIDEOPRESS_FLOW, isHostingSiteCreationFlow } from '@automattic/onboarding';
import { NewHostedSiteOptions } from './new-hosted-site-options';
import { SiteOptions } from './site-options';
import { VideoPressSiteOptions } from './videopress-site-options';
import type { Step } from '../../types';
import './style.scss';

const SiteOptionsStepRouter: Step = function SiteOptionsStepRouter( { navigation, flow } ) {
	if ( isHostingSiteCreationFlow( flow ) ) {
		return <NewHostedSiteOptions navigation={ navigation } />;
	}

	if ( flow === VIDEOPRESS_FLOW ) {
		return <VideoPressSiteOptions navigation={ navigation } />;
	}

	return <SiteOptions navigation={ navigation } />;
};

export default SiteOptionsStepRouter;
