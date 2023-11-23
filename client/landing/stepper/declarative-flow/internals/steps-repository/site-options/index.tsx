import { VIDEOPRESS_FLOW, VIDEOPRESS_TV_FLOW } from '@automattic/onboarding';
import { SiteOptions } from './site-options';
import { VideoPressSiteOptions } from './videopress-site-options';
import type { Step } from '../../types';
import './style.scss';

const SiteOptionsStepRouter: Step = function SiteOptionsStepRouter( { navigation, flow } ) {
	if ( flow === VIDEOPRESS_FLOW || flow === VIDEOPRESS_TV_FLOW ) {
		return <VideoPressSiteOptions navigation={ navigation } />;
	}

	return <SiteOptions navigation={ navigation } />;
};

export default SiteOptionsStepRouter;
